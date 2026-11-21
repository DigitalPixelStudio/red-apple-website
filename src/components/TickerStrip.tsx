/**
 * TickerStrip — a single moving hairline of text between sections.
 *
 * It is one composited transform on a duplicated track, so the browser paints
 * the text once and only translates it. MotionGovernor pauses it when the strip
 * is off screen; `prefers-reduced-motion` stops it entirely.
 */

const ITEMS = [
  "Front glass restoration",
  "TBK OCA vacuum lamination",
  "90-litre bubble remover",
  "TBK-958 cold UV laser",
  "Original OLED retained",
  "6 Months repair warranty",
  "Zero-password privacy",
  "Apple Diagnostic Mode testing",
  "Halasuru · Bengaluru",
];

export default function TickerStrip({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`ticker-strip${reverse ? " is-reverse" : ""}`}>
      <span className="sr-only">
        {ITEMS.join(" · ")}
      </span>
      <div className="ticker-track" aria-hidden="true">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={item + i} className="ticker-item">
            <span className="ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
