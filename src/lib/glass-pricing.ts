/**
 * glass-pricing.ts — Front Glass Restoration price list
 *
 * This is the single source of truth for the glass-restoration prices the shop
 * supplied. The estimator, the chatbot, the knowledge base and the glass-lab
 * section all read from this file so a price can never drift between screens.
 *
 * Rules:
 *  · Prices are for FRONT GLASS RESTORATION only — not full display replacement.
 *  · Final eligibility is confirmed by a technician after inspection.
 *  · A model that is not listed here has no published glass price; the UI must
 *    fall back to "On WhatsApp" / "confirmed after inspection", never a guess.
 */

export type GlassPriceRow = {
  /** Human label shown in the UI. */
  model: string;
  /** Rupees, fixed price for front-glass restoration. */
  price: number;
  /** Series heading used to group the list. */
  series: string;
  /** Extra spellings that should resolve to this row. */
  aliases?: string[];
};

export const GLASS_PRICE_ROWS: GlassPriceRow[] = [
  // ---------- iPhone 18 ----------
  { model: "iPhone 18 Pro Max", price: 19500, series: "iPhone 18" },
  { model: "iPhone 18 Pro", price: 18500, series: "iPhone 18" },
  { model: "iPhone 18 Plus", price: 15500, series: "iPhone 18" },
  { model: "iPhone 18", price: 14500, series: "iPhone 18" },

  // ---------- iPhone 17 ----------
  { model: "iPhone 17 Pro Max", price: 16500, series: "iPhone 17" },
  { model: "iPhone 17 Pro", price: 15500, series: "iPhone 17" },
  { model: "iPhone 17 Plus", price: 13000, series: "iPhone 17" },
  { model: "iPhone 17", price: 12000, series: "iPhone 17" },

  // ---------- iPhone 16 ----------
  { model: "iPhone 16 Pro Max", price: 14500, series: "iPhone 16" },
  { model: "iPhone 16 Pro", price: 13500, series: "iPhone 16" },
  { model: "iPhone 16 Plus", price: 11000, series: "iPhone 16" },
  { model: "iPhone 16", price: 10000, series: "iPhone 16" },

  // ---------- iPhone 15 ----------
  { model: "iPhone 15 Pro Max", price: 11500, series: "iPhone 15" },
  { model: "iPhone 15 Pro", price: 10500, series: "iPhone 15" },
  { model: "iPhone 15 Plus", price: 8500, series: "iPhone 15" },
  { model: "iPhone 15", price: 7500, series: "iPhone 15" },

  // ---------- iPhone 14 ----------
  { model: "iPhone 14 Pro Max", price: 8500, series: "iPhone 14" },
  { model: "iPhone 14 Pro", price: 7500, series: "iPhone 14" },
  { model: "iPhone 14 Plus", price: 6500, series: "iPhone 14" },
  { model: "iPhone 14", price: 5500, series: "iPhone 14" },

  // ---------- iPhone 13 ----------
  { model: "iPhone 13 Pro Max", price: 7000, series: "iPhone 13" },
  { model: "iPhone 13 Pro", price: 6000, series: "iPhone 13" },
  { model: "iPhone 13", price: 4500, series: "iPhone 13" },
  { model: "iPhone 13 Mini", price: 4000, series: "iPhone 13", aliases: ["iPhone 13 mini"] },

  // ---------- iPhone 12 ----------
  { model: "iPhone 12 Pro Max", price: 5500, series: "iPhone 12" },
  { model: "iPhone 12 Pro", price: 4500, series: "iPhone 12" },
  { model: "iPhone 12", price: 4000, series: "iPhone 12" },
  { model: "iPhone 12 Mini", price: 3500, series: "iPhone 12", aliases: ["iPhone 12 mini"] },

  // ---------- iPhone 11 ----------
  { model: "iPhone 11 Pro Max", price: 4000, series: "iPhone 11" },
  {
    model: "iPhone 11 Pro / 11",
    price: 3500,
    series: "iPhone 11",
    aliases: ["iPhone 11 Pro", "iPhone 11"],
  },

  // ---------- iPhone X / SE ----------
  {
    model: "iPhone X / XS / XR",
    price: 3000,
    series: "iPhone X / SE",
    aliases: ["iPhone X", "iPhone XS", "iPhone XS Max", "iPhone XR"],
  },
  {
    model: "iPhone 8 / SE (Gen 2/3)",
    price: 2500,
    series: "iPhone X / SE",
    aliases: [
      "iPhone 8",
      "iPhone SE (2nd Gen)",
      "iPhone SE (3rd Gen)",
      "iPhone SE (2nd G)",
      "iPhone SE (3rd G)",
      "iPhone SE 2",
      "iPhone SE 3",
    ],
  },
];

export const GLASS_PRICE_MIN = Math.min(...GLASS_PRICE_ROWS.map((r) => r.price)); // ₹2,500
export const GLASS_PRICE_MAX = Math.max(...GLASS_PRICE_ROWS.map((r) => r.price)); // ₹19,500
export const GLASS_WARRANTY_MONTHS = 6;

/** Series in the order supplied, used for the grouped model picker. */
export const GLASS_SERIES = Array.from(new Set(GLASS_PRICE_ROWS.map((r) => r.series)));

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const LOOKUP: Map<string, GlassPriceRow> = (() => {
  const map = new Map<string, GlassPriceRow>();
  for (const row of GLASS_PRICE_ROWS) {
    map.set(normalize(row.model), row);
    for (const alias of row.aliases ?? []) map.set(normalize(alias), row);
  }
  return map;
})();

/**
 * Exact glass price for a model, or null when the model is not on the
 * published list. Never derives or interpolates a price.
 */
export function glassPriceFor(model: string): number | null {
  if (!model) return null;
  const row = LOOKUP.get(normalize(model));
  return row ? row.price : null;
}

/** Same as glassPriceFor but returns the whole row, for labels/tooltips. */
export function glassRowFor(model: string): GlassPriceRow | null {
  if (!model) return null;
  return LOOKUP.get(normalize(model)) ?? null;
}

/** Grouped rows for rendering the price board. */
export function glassRowsBySeries(): { series: string; rows: GlassPriceRow[] }[] {
  return GLASS_SERIES.map((series) => ({
    series,
    rows: GLASS_PRICE_ROWS.filter((row) => row.series === series),
  }));
}
