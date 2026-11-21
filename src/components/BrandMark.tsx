/**
 * BrandMark — the Red Apple company logo as a component.
 *
 * Uses the real uploaded logo (/logo.png) so the brand stays identical
 * everywhere. Previously this spot showed an Apple glyph, which read as
 * "we are Apple" rather than "we repair Apple".
 *
 * Goes through SmartImg so a stale cache or a half-finished deploy can never
 * paint the browser's torn-image glyph where the logo should be.
 */
import SmartImg from "./SmartImg";

export default function BrandMark({
  size = 32,
  className = "",
  rounded = true,
  priority = false,
}: {
  size?: number;
  className?: string;
  rounded?: boolean;
  priority?: boolean;
}) {
  return (
    <SmartImg
      src="/logo.png"
      alt="Red Apple Mobile Repair Store"
      width={size}
      height={size}
      priority={priority}
      className={`${rounded ? "rounded-[22%]" : ""} object-contain ${className}`}
    />
  );
}
