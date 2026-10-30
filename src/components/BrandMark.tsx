/**
 * BrandMark — the Red Apple company logo as a component.
 *
 * Uses the real uploaded logo (/logo.png) so the brand stays identical
 * everywhere. Previously this spot showed an Apple glyph, which read as
 * "we are Apple" rather than "we repair Apple".
 */
export default function BrandMark({
  size = 32,
  className = "",
  rounded = true,
}: {
  size?: number;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <img
      src="/logo.png"
      alt="Red Apple Mobile Repair Store"
      width={size}
      height={size}
      className={`${rounded ? "rounded-[22%]" : ""} object-contain ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
