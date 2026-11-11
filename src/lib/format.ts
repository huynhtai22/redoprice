export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const formatUSD2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatNum = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d });
export const pct = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 100)}%`;
/** Round to a "quote-like" figure: nearest $10 under $1k, $50 under $10k, else $100. */
export const roundMoney = (n: number) => {
  const step = n < 1000 ? 10 : n < 10000 ? 50 : 100;
  return Math.round(n / step) * step;
};
