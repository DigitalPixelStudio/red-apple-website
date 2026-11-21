/**
 * SectionDivider — a restrained transition between sections.
 *
 * A static hairline with one small light travelling along it. Transform-only,
 * 1px tall, no images and no layout shift.
 */
export default function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <span className="section-divider-light" />
    </div>
  );
}
