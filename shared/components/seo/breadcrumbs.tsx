import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "./jsonLd";

export default function Breadcrumbs({ items }: { items: Array<{ name: string; href?: string }> }) {
  const schemaItems = [{ name: "Home", url: "https://agriminds.org/" }, ...items.map((item) => ({ name: item.name, url: `https://agriminds.org${item.href || ""}` }))];
  return <><JsonLd data={breadcrumbJsonLd(schemaItems)} /><nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-foreground-muted"><Link href="/" className="hover:text-primary">Home</Link>{items.map((item) => <span key={`${item.name}-${item.href || "current"}`} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5" />{item.href ? <Link href={item.href} className="hover:text-primary">{item.name}</Link> : <span className="text-foreground-body">{item.name}</span>}</span>)}</nav></>;
}
