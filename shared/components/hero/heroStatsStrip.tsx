import { STATS } from "@/shared/data/agriminds";
import CounterStat from "@/shared/components/molecules/counterStat";
import { cx } from "@/shared/lib/utils";

// Index 2 sits at the start of row 2 in the 2-column mobile layout, so its divider
// only makes sense once the grid becomes 4 columns at md+.
const BORDER_CLASS = ["border-l-0", "border-l border-border", "border-l-0 md:border-l md:border-border", "border-l border-border"];

/**
 * The stats strip that peeks up over the hero's bottom edge — a full-bleed rounded-top
 * card rather than the site's usual centered floating card, to match the new hero's
 * "curtain rising" feel as you scroll past the sky into the page content.
 */
export default function HeroStatsStrip() {
  return (
    <section className="relative z-[6] -mt-16 grid grid-cols-2 gap-y-8 rounded-t-[28px] bg-surface-card px-5 pt-14 pb-16 sm:px-8 md:grid-cols-4 md:gap-y-0">
      {STATS.map((stat, i) => (
        <div key={stat.label} className={cx("px-7", BORDER_CLASS[i])}>
          <CounterStat value={stat.value} className="font-display block text-4xl font-semibold text-primary sm:text-5xl" />
          <div className="mt-2.5 text-sm leading-snug font-medium text-foreground-heading">
            {stat.label}
            <span className="mt-1 block text-xs text-foreground-muted">{stat.sublabel}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
