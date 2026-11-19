#!/usr/bin/env python3
"""
Build RedoPrice's sourced data files from the official public downloads.

    python3 -I scripts/import_public_data.py <folder-with-downloads> [--release 2026-11]

Expects these files in the folder (download them in a browser; bls.gov and eia.gov block scripts):
  oesm25nat.zip / national_M2025_dl.xlsx   BLS OEWS national       https://www.bls.gov/oes/tables.htm
  oesm25st.zip  / state_M2025_dl.xlsx      BLS OEWS by state
  oesm25ma.zip  / MSA_M2025_dl.xlsx        BLS OEWS by metro area
  table_5_06_a.xlsx                        EIA Electric Power Monthly, Table 5.6.A
  bea-rpp-goods-2024.csv                   BEA Regional Price Parities, goods (via FRED release 403), in data-raw/

Writes / updates in src/data/<release>/:
  labor-wages.json     per-trade hourly wages (mean + median) for the US, every state and every site metro
  regional-index.json  laborIndex (BLS) and materialIndex (BEA RPP goods) per state
  metro-index.json     laborIndex per metro (BLS)
  energy-solar.json    residentialCentsPerKwh (EIA)
Needs: openpyxl (pip install openpyxl).
"""
import csv, io, json, re, sys, zipfile
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
RELEASE = next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--release"), "2026-11")
SRC = Path(args[0]).expanduser() if args else ROOT / "data-raw"
OUT = ROOT / "src" / "data" / RELEASE
TODAY = date.today().isoformat()
VERSION = RELEASE.replace("-", ".") + ".1"

# Trades that do the work we price. Weight = employment, so laborers and carpenters count most.
TRADES = {
    "47-2181": "Roofers",
    "47-2031": "Carpenters",
    "47-2111": "Electricians",
    "47-2152": "Plumbers, pipefitters and steamfitters",
    "49-9021": "HVAC mechanics and installers",
    "47-2061": "Construction laborers",
    "47-2121": "Glaziers",
    "47-4031": "Fence erectors",
    "47-2231": "Solar photovoltaic installers",
    "47-2211": "Sheet metal workers",
}

# Site metro slug -> (name prefix as BLS titles it, state code). Matched against AREA_TITLE.
METRO_MATCH = {
    "new-york": ("New York-Newark-Jersey City", "NY"), "los-angeles": ("Los Angeles-Long Beach-Anaheim", "CA"),
    "chicago": ("Chicago-Naperville-Elgin", "IL"), "dallas": ("Dallas-Fort Worth-Arlington", "TX"),
    "houston": ("Houston-", "TX"), "washington": ("Washington-Arlington-Alexandria", "DC"),
    "philadelphia": ("Philadelphia-Camden-Wilmington", "PA"), "miami": ("Miami-Fort Lauderdale", "FL"),
    "atlanta": ("Atlanta-Sandy Springs", "GA"), "boston": ("Boston-Cambridge-Newton", "MA"),
    "phoenix": ("Phoenix-Mesa", "AZ"), "san-francisco": ("San Francisco-Oakland", "CA"),
    "riverside": ("Riverside-San Bernardino-Ontario", "CA"), "detroit": ("Detroit-Warren-Dearborn", "MI"),
    "seattle": ("Seattle-Tacoma-Bellevue", "WA"), "minneapolis": ("Minneapolis-St. Paul", "MN"),
    "san-diego": ("San Diego-", "CA"), "tampa": ("Tampa-St. Petersburg-Clearwater", "FL"),
    "denver": ("Denver-Aurora", "CO"), "baltimore": ("Baltimore-Columbia-Towson", "MD"),
    "st-louis": ("St. Louis", "MO"), "orlando": ("Orlando-Kissimmee-Sanford", "FL"),
    "charlotte": ("Charlotte-Concord-Gastonia", "NC"), "san-antonio": ("San Antonio-New Braunfels", "TX"),
    "portland": ("Portland-Vancouver-Hillsboro", "OR"), "sacramento": ("Sacramento-Roseville", "CA"),
    "pittsburgh": ("Pittsburgh", "PA"), "austin": ("Austin-Round Rock", "TX"),
    "las-vegas": ("Las Vegas-Henderson", "NV"), "cincinnati": ("Cincinnati", "OH"),
    "kansas-city": ("Kansas City", "MO"), "columbus": ("Columbus", "OH"),
    "indianapolis": ("Indianapolis-", "IN"), "cleveland": ("Cleveland", "OH"),
    "san-jose": ("San Jose-Sunnyvale-Santa Clara", "CA"), "nashville": ("Nashville-Davidson", "TN"),
    "virginia-beach": ("Virginia Beach-", "VA"), "providence": ("Providence-Warwick", "RI"),
    "jacksonville": ("Jacksonville", "FL"), "milwaukee": ("Milwaukee-Waukesha", "WI"),
    "raleigh": ("Raleigh", "NC"), "oklahoma-city": ("Oklahoma City", "OK"),
    "memphis": ("Memphis", "TN"), "richmond": ("Richmond", "VA"),
    "louisville": ("Louisville/Jefferson County", "KY"), "salt-lake-city": ("Salt Lake City", "UT"),
    "birmingham": ("Birmingham-", "AL"), "buffalo": ("Buffalo-Cheektowaga", "NY"),
}


def find(patterns):
    for p in patterns:
        hits = sorted(SRC.glob(p))
        if hits:
            return hits[0]
    return None


def open_xlsx(path_or_zip, inner_regex):
    """Open an xlsx directly or the first matching member inside a BLS zip."""
    p = Path(path_or_zip)
    if p.suffix == ".zip":
        z = zipfile.ZipFile(p)
        name = next(n for n in z.namelist() if re.search(inner_regex, n, re.I) and n.endswith(".xlsx"))
        return openpyxl.load_workbook(io.BytesIO(z.read(name)), read_only=True, data_only=True), name
    return openpyxl.load_workbook(p, read_only=True, data_only=True), p.name


def num(v):
    """BLS uses * (suppressed), ** (no estimate) and # (>= $115/hr top-code)."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace(",", "")
    if s == "#":
        return 115.0
    try:
        return float(s)
    except ValueError:
        return None


def oews_rows(path, inner):
    wb, name = open_xlsx(path, inner)
    ws = wb.worksheets[0]
    it = ws.iter_rows(values_only=True)
    head = [str(h or "").strip().upper() for h in next(it)]
    ix = {h: i for i, h in enumerate(head)}
    for r in it:
        occ = str(r[ix["OCC_CODE"]] or "").strip()
        if occ not in TRADES:
            continue
        # Cross-industry, all ownerships only (state/metro files are already cross-industry)
        if "NAICS" in ix and str(r[ix["NAICS"]]).strip() not in ("000000", "0", "None"):
            continue
        if "I_GROUP" in ix and str(r[ix["I_GROUP"]]).strip().lower() not in ("cross-industry", "none"):
            continue
        yield {
            "area": str(r[ix["AREA"]]).strip(),
            "title": str(r[ix["AREA_TITLE"]]).strip(),
            "state": str(r[ix["PRIM_STATE"]]).strip() if "PRIM_STATE" in ix else "",
            "occ": occ,
            "emp": num(r[ix["TOT_EMP"]]),
            "mean": num(r[ix["H_MEAN"]]),
            "median": num(r[ix["H_MEDIAN"]]),
        }
    print(f"  read {name}")


def index_for(rows, nat):
    """Employment-weighted mean wage across trades, priced at the national employment mix, relative to the US.
    Using the national mix (not local) keeps the index a pure wage comparison."""
    w = {r["occ"]: r for r in rows if r["mean"]}
    num_, den = 0.0, 0.0
    for occ, n in nat.items():
        if occ in w and n["emp"] and n["mean"]:
            num_ += w[occ]["mean"] * n["emp"]
            den += n["mean"] * n["emp"]
    return round(num_ / den, 3) if den else None


def wage_row(rows):
    return {r["occ"]: {"mean": r["mean"], "median": r["median"], "emp": r["emp"]} for r in rows}


def load_json(name):
    return json.loads((OUT / name).read_text())


def save_json(name, data):
    (OUT / name).write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    print(f"  wrote src/data/{RELEASE}/{name}")


def main():
    print(f"Reading downloads from {SRC}")
    nat_f = find(["oesm*nat.zip", "national_M*_dl.xlsx"])
    st_f = find(["oesm*st.zip", "state_M*_dl.xlsx"])
    ma_f = find(["oesm*ma.zip", "MSA_M*_dl.xlsx"])
    eia_f = find(["table_5_06_a*.xlsx"])
    rpp_f = find(["bea-rpp-goods-*.csv"]) or (ROOT / "data-raw" / "bea-rpp-goods-2024.csv")

    regional = load_json("regional-index.json")
    metros = load_json("metro-index.json")
    by_name = {s["name"]: s for s in regional["states"]}

    if nat_f and st_f:
        period = re.search(r"oesm(\d\d)", nat_f.name) or re.search(r"_M(\d{4})", nat_f.name)
        yr = period.group(1)
        yr = ("20" + yr) if len(yr) == 2 else yr
        nat_rows = list(oews_rows(nat_f, r"national"))
        nat = {r["occ"]: r for r in nat_rows if r["area"] in ("99", "0000000", "US", "1") or True}
        st_rows = list(oews_rows(st_f, r"state"))
        wages = {"meta": {}, "trades": TRADES, "us": wage_row(nat_rows), "states": {}, "metros": {}}
        missing = []
        for s in regional["states"]:
            rows = [r for r in st_rows if r["title"] == s["name"]]
            idx = index_for(rows, nat)
            if idx is None:
                missing.append(s["code"])
                continue
            s["laborIndex"] = idx
            wages["states"][s["code"]] = wage_row(rows)
        if ma_f:
            ma_rows = list(oews_rows(ma_f, r"MSA"))
            titles = sorted({r["title"] for r in ma_rows})
            for m in metros["metros"]:
                prefix, st = METRO_MATCH.get(m["slug"], (m["name"], m["state"]))
                title = next((t for t in titles if t.startswith(prefix) and re.search(rf"\b{st}\b", t)), None) \
                    or next((t for t in titles if t.startswith(m["name"]) and re.search(rf"\b{m['state']}\b", t)), None)
                if not title:
                    missing.append(m["slug"])
                    continue
                rows = [r for r in ma_rows if r["title"] == title]
                idx = index_for(rows, nat)
                if idx:
                    m["laborIndex"] = idx
                    m["blsArea"] = title
                    wages["metros"][m["slug"]] = wage_row(rows)
        ref = {
            "label": f"Occupational Employment and Wage Statistics (OEWS), May {yr}",
            "publisher": "U.S. Bureau of Labor Statistics", "url": "https://www.bls.gov/oes/tables.htm", "period": f"May {yr}",
        }
        method = ("laborIndex = sum(local hourly mean wage x US employment) / sum(US hourly mean wage x US employment) across "
                  + ", ".join(TRADES.values()) + ". US = 1.00.")
        wages["meta"] = {"dataset": "labor-wages", "version": VERSION, "updated": TODAY, "status": "sourced",
                         "sources": [f"BLS OEWS May {yr}: hourly mean and median wages for {len(TRADES)} construction trades"],
                         "refs": [ref], "notes": "Raw wages by trade for the US, each state and each site metro. Wages are what workers earn, not what contractors bill: contractors add payroll taxes, insurance, overhead and profit. " + method}
        save_json("labor-wages.json", wages)
        regional["meta"].update({"version": VERSION, "updated": TODAY, "status": "sourced"})
        regional["meta"]["refs"] = [ref] + [r for r in regional["meta"].get("refs", []) if "OEWS" not in r["label"]]
        metros["meta"].update({"version": VERSION, "updated": TODAY, "status": "sourced", "refs": [ref],
                               "sources": [f"BLS OEWS May {yr}, metropolitan area wages for {len(TRADES)} construction trades"],
                               "notes": "Metro laborIndex relative to the US average (1.00); overrides the state value on city pages. " + method})
        save_json("metro-index.json", metros)
        if missing:
            print("  WARNING no BLS match for:", missing)
    else:
        print("  BLS OEWS files not found, labor indexes unchanged")

    # Materials: BEA Regional Price Parities, goods
    if rpp_f and Path(rpp_f).exists():
        with open(rpp_f) as fh:
            for row in csv.DictReader(fh):
                s = by_name.get(row["state"])
                if s:
                    s["materialIndex"] = round(float(row["rpp_goods_2024"]) / 100, 3)
        rpp_ref = {"label": "Regional Price Parities by State, Goods, 2024", "publisher": "U.S. Bureau of Economic Analysis (via FRED)",
                   "url": "https://fred.stlouisfed.org/release/tables?rid=403&eid=233639", "period": "2024"}
        regional["meta"]["refs"] = [r for r in regional["meta"].get("refs", []) if "Price Parities" not in r["label"]] + [rpp_ref]
    labor_sourced = any("OEWS" in r["label"] for r in regional["meta"].get("refs", []))
    regional["meta"]["sources"] = [r["publisher"] + ": " + r["label"] for r in regional["meta"].get("refs", [])]
    if not labor_sourced:
        regional["meta"]["sources"].insert(0, "laborIndex: RedoPrice modeled estimate, pending import of BLS OEWS May 2025 state wages")
    regional["meta"]["notes"] = (("laborIndex from BLS OEWS construction trade wages (see labor-wages.json)" if labor_sourced else
                                  "laborIndex is still a modeled estimate (BLS import pending)")
                                 + "; materialIndex = BEA RPP goods / 100, a broad price level for goods in the state, not a construction-specific index. "
                                 "zip3 ranges map the first 3 ZIP digits to a state.")
    regional["meta"]["status"] = "sourced" if labor_sourced else "partial"
    regional["meta"]["version"] = VERSION
    regional["meta"]["updated"] = TODAY
    save_json("regional-index.json", regional)

    # Electricity: EIA Table 5.6.A
    if eia_f:
        energy = load_json("energy-solar.json")
        prices, period = parse_eia(eia_f, by_name)
        energy["residentialCentsPerKwh"].update(prices)
        energy["meta"].setdefault("refs", [])
        energy["meta"]["refs"] = [r for r in energy["meta"]["refs"] if "Electric Power Monthly" not in r["label"]] + [{
            "label": f"Electric Power Monthly, Table 5.6.A, residential average price ({period})",
            "publisher": "U.S. Energy Information Administration", "url": "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a", "period": period}]
        energy["meta"].update({"version": VERSION, "updated": TODAY, "status": "partial"})
        energy["meta"]["sources"] = [f"EIA Electric Power Monthly, Table 5.6.A: average residential price by state ({period})"] + \
            [x for x in energy["meta"]["sources"] if not x.startswith("Electricity prices")]
        save_json("energy-solar.json", energy)
        print(f"  EIA: {len(prices)} states, period {period}")


def parse_eia(path, by_name):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    # Header row that names the sectors; the first "Residential" column is the latest month.
    hi = next(i for i, r in enumerate(rows) if any(str(c or "").strip().lower() == "residential" for c in r))
    col = next(j for j, c in enumerate(rows[hi]) if str(c or "").strip().lower() == "residential")
    sub = rows[hi + 1] if hi + 1 < len(rows) else []
    title = " ".join(str(c) for c in rows[0] if c) if rows else ""
    period = str(sub[col] if col < len(sub) and sub[col] else "").strip() or title
    out = {}
    for r in rows[hi + 1:]:
        name = str(r[0] or "").strip()
        s = by_name.get(name)
        v = num(r[col]) if col < len(r) else None
        if s and v:
            out[s["code"]] = round(v, 2)
    return out, period


if __name__ == "__main__":
    main()
