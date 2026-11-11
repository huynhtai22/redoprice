import Breadcrumbs from "./Breadcrumbs";
export default function StaticPage({ title, path, updated, children }: { title: string; path: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-5">
      <Breadcrumbs items={[{ href: path, label: title }]} />
      <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
      {updated && <p className="mt-1 text-sm text-mute">Last updated {updated}</p>}
      <div className="prose-x mt-6">{children}</div>
    </div>
  );
}
