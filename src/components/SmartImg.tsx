"use client";

import { useCallback, useState } from "react";

type Props = {
  src: string;
  alt: string;
  /** Swap target when the original fails. Defaults to a real store photo. */
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  /** Above-the-fold images: eager + high priority. */
  priority?: boolean;
  style?: React.CSSProperties;
};

const DEFAULT_FALLBACK = "/images/v4/iphone-product.jpg";

/**
 * SmartImg — an <img> that can never render a broken-image icon.
 *
 * Every photo on the site is real, but a 404 from a stale cache, a blocked CDN
 * or a half-finished deploy should never show the browser's torn-page glyph.
 * If the requested file fails we swap once to a related, guaranteed file; if
 * that fails too we hide the element and let the card's own background show.
 *
 * It also always declares intrinsic width/height so nothing shifts while the
 * image decodes (the main source of "jerky" section loading on long pages).
 */
export default function SmartImg({
  src,
  alt,
  fallback = DEFAULT_FALLBACK,
  className = "",
  width,
  height,
  sizes,
  priority = false,
  style,
}: Props) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  // Cached images finish before React hydrates, so onLoad never fires for them.
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) {
      node.dataset.loaded = "true";
    }
  }, []);

  if (failed) {
    // Keep the layout box, drop the broken glyph.
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: "block",
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      ref={ref}
      src={current || fallback}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onLoad={(e) => {
        e.currentTarget.dataset.loaded = "true";
      }}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
        else setFailed(true);
      }}
      className={`smart-img ${className}`}
      style={style}
    />
  );
}
