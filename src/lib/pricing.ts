/**
 * pricing.ts — model + repair → price.
 *
 * STRUCTURE IS FINAL. The numbers below are the ones already published on the
 * site (the Apple-vs-us comparison table). Anything not listed resolves to
 * `null`, which the UI renders as "Get exact quote on WhatsApp" — never a guess.
 *
 * To fill from the client's spreadsheet, add rows to PRICES in the shape:
 *   "iPhone 16 Pro Max": { "Front Display Replacement": 24635, ... }
 *
 * Repair keys MUST match REPAIR_TYPES in site.ts exactly, because that is what
 * the wizard shows the customer.
 */

export type RepairPriceMap = Record<string, number | null>;

/** model -> repair type -> price in rupees */
export const PRICES: Record<string, RepairPriceMap> = {
  // ---- iPhone displays (published) ----
  "iPhone 16 Pro Max": { "Front Display Replacement": 24635, "Back Glass Replacement": 5785 },
  "iPhone 16 Pro":     { "Front Display Replacement": 21385, "Back Glass Replacement": 5785 },
  "iPhone 16 Plus":    { "Front Display Replacement": 21385, "Back Glass Replacement": 5785 },
  "iPhone 16":         { "Front Display Replacement": 21385, "Back Glass Replacement": 5785 },
  "iPhone 15 Pro Max": { "Front Display Replacement": 20085, "Back Glass Replacement": 5785 },
  "iPhone 15 Pro":     { "Front Display Replacement": 18135, "Back Glass Replacement": 5785 },
  "iPhone 15 Plus":    { "Front Display Replacement": 18135, "Back Glass Replacement": 5785 },
  "iPhone 15":         { "Front Display Replacement": 18135, "Back Glass Replacement": 5785 },
  "iPhone 14 Pro Max": { "Front Display Replacement": 14885, "Back Glass Replacement": 5135 },
  "iPhone 14 Pro":     { "Front Display Replacement": 14885, "Back Glass Replacement": 5135 },
  "iPhone 14 Plus":    { "Front Display Replacement": 14885, "Back Glass Replacement": 5135 },
  "iPhone 14":         { "Front Display Replacement": 14885, "Back Glass Replacement": 5135 },
  "iPhone 13 Pro Max": { "Front Display Replacement": 12935, "Back Glass Replacement": 4485 },
  "iPhone 13 Pro":     { "Front Display Replacement": 12935, "Back Glass Replacement": 4485 },
  "iPhone 13 mini":    { "Front Display Replacement": 12935, "Back Glass Replacement": 4485 },
  "iPhone 13":         { "Front Display Replacement": 12935, "Back Glass Replacement": 4485 },
  "iPhone 12 Pro Max": { "Front Display Replacement": 11635, "Back Glass Replacement": 4485 },
  "iPhone 12 Pro":     { "Front Display Replacement": 11635, "Back Glass Replacement": 4485 },
  "iPhone 12 mini":    { "Front Display Replacement": 11635, "Back Glass Replacement": 4485 },
  "iPhone 12":         { "Front Display Replacement": 11635, "Back Glass Replacement": 4485 },
  "iPhone SE (3rd Gen)": { "Front Display Replacement": 11635, "Back Glass Replacement": 4485 },
  "iPhone 11 Pro Max": { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone 11 Pro":     { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone 11":         { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone XS Max":     { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone XS":         { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone XR":         { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
  "iPhone X":          { "Front Display Replacement": 10335, "Back Glass Replacement": 4485 },
};

/** Turnaround in minutes per repair type — shown next to the price. */
export const TURNAROUND: Record<string, string> = {
  "Front Display Replacement": "~45 min",
  "Back Glass Replacement": "~60 min",
  "Battery Replacement": "~30 min",
  "Camera Repair": "~60 min",
  "Charging Port / Flex": "~45 min",
  "Speaker / Mic / Haptics": "~45 min",
  "Motherboard / IC Repair": "2–3 days",
  "Water Damage Revival": "24–48 hrs",
  "Software / iOS Issue": "~2 hrs",
  "Data Recovery": "1–2 days",
  "Unlocking (lawful)": "Same day",
  "OS / Firmware Installation": "~2 hrs",
  "Dent / Body / Frame Repair": "1–2 days",
  "Other / Not sure": "Diagnosis first",
};

/** The one-line note we show under a price. */
export function priceNote(repair: string): string {
  if (repair === "Other / Not sure") return "Free diagnosis, then a fixed price before any work.";
  if (repair === "Motherboard / IC Repair" || repair === "Data Recovery") {
    return "Board-level work is quoted after a free diagnosis.";
  }
  return "Parts and labour included · 90-day warranty";
}

/**
 * Look up a price. Returns null when the combination is not in the table —
 * the UI must then offer WhatsApp instead of inventing a number.
 */
export function getPrice(model: string, repair: string): number | null {
  const row = PRICES[model];
  if (!row) return null;
  const v = row[repair];
  return typeof v === "number" ? v : null;
}

/** True when we have at least one price for this model. */
export function hasAnyPrice(model: string): boolean {
  const row = PRICES[model];
  return Boolean(row && Object.values(row).some((v) => typeof v === "number"));
}

/** Cheapest and dearest published price, for "from ₹X" copy. */
export function priceRange(): { min: number; max: number } {
  let min = Infinity;
  let max = 0;
  for (const row of Object.values(PRICES)) {
    for (const v of Object.values(row)) {
      if (typeof v === "number") {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
  }
  return { min: min === Infinity ? 0 : min, max };
}

/** Human format: 24635 -> "₹24,635" */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
