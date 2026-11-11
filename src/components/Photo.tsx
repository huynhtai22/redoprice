import { photoFor, photoUrl } from "@/lib/photos";

type Props = { name: string; ratio?: string; sizes?: string; priority?: boolean; className?: string; caption?: string; credit?: boolean };

/** A credited editorial photo (credit=false when it sits inside a link; credit it elsewhere on the page or in /about). The ratio is fixed so the image never shifts the layout. */
export default function Photo({ name, ratio = "4 / 3", sizes = "(min-width: 1024px) 480px, 100vw", priority = false, className = "", caption, credit = true }: Props) {
  const p = photoFor(name);
  if (!p) return null;
  const widths = [480, 720, 960, 1280];
  return (
    <figure className={className}>
      <div className="photo overflow-hidden rounded-md" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash's CDN resizes, so we skip Vercel's image quota */}
        <img
          src={photoUrl(p.id, 960)}
          srcSet={widths.map((w) => `${photoUrl(p.id, w)} ${w}w`).join(", ")}
          sizes={sizes}
          alt={p.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
      {credit && <figcaption className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-mute">
        {caption && <span className="text-ink-2">{caption}</span>}
        <span>
          Photo: <a href={`${p.page}?utm_source=redoprice&utm_medium=referral`} rel="nofollow noopener" target="_blank" className="hover:text-ink hover:underline">{p.credit}</a> / Unsplash
        </span>
      </figcaption>}
    </figure>
  );
}
