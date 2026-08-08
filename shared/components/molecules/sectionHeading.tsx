import { cx } from "@/shared/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <div
          className={cx(
            "flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase",
            align === "center" && "justify-center",
            tone === "dark" ? "text-accent" : "text-accent",
          )}
        >
          <span className="h-px w-8 bg-current" />
          {eyebrow}
        </div>
      ) : null}
      <h2
        className={cx(
          "font-display mt-4 text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl lg:text-5xl",
          tone === "dark" ? "text-deep-foreground" : "text-foreground-heading",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cx(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-deep-muted" : "text-foreground-body",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
