/**
 * pricing.ts — GENERATED FROM Red_Apple_Mobile_Repairs_Pricing.xlsx
 *
 * Do not hand-edit the PRICES table. Regenerate from the spreadsheet so the
 * site can never drift from the sheet the shop actually quotes from.
 *
 * Each entry is [min, max]. When min === max the price is fixed; otherwise the
 * UI shows "₹a – ₹b" because the sheet itself gives a range (part variance).
 *
 * A missing entry means the sheet does not cover that model+repair. The UI must
 * then offer "Other / Not sure" and route to WhatsApp — never invent a number.
 */

export type Price = [number, number];
export type RepairPriceMap = Record<string, Price>;

/** model -> repair type -> [min, max] rupees */
export const PRICES: Record<string, RepairPriceMap> = {
  "Apple Watch SE 2": { "Front Display Replacement": [3500, 3500], "Battery Replacement": [2000, 2000], "Dent / Body / Frame Repair": [2000, 2000] },
  "Apple Watch Series 7": { "Front Display Replacement": [6000, 6000], "Battery Replacement": [2500, 2500], "Dent / Body / Frame Repair": [2500, 2500] },
  "Apple Watch Series 8": { "Front Display Replacement": [7500, 7500], "Battery Replacement": [3000, 3000], "Dent / Body / Frame Repair": [3000, 3000] },
  "Apple Watch Series 9": { "Front Display Replacement": [9000, 9000], "Battery Replacement": [3500, 3500], "Dent / Body / Frame Repair": [3500, 3500] },
  "Apple Watch Ultra": { "Front Display Replacement": [12000, 12000], "Battery Replacement": [4000, 4000], "Dent / Body / Frame Repair": [4500, 4500] },
  "Apple Watch Ultra 2": { "Front Display Replacement": [14000, 14000], "Battery Replacement": [4500, 4500], "Dent / Body / Frame Repair": [5000, 5000] },
  "iPad 10th Gen": { "Front Display Replacement": [9000, 9000], "Battery Replacement": [3500, 3500], "Charging Port / Flex": [2000, 2000], "Dent / Body / Frame Repair": [2000, 2000] },
  "iPad 9th Gen": { "Front Display Replacement": [6000, 6000], "Battery Replacement": [2500, 2500], "Charging Port / Flex": [1500, 1500], "Dent / Body / Frame Repair": [1500, 1500] },
  "iPad Air": { "Front Display Replacement": [12000, 12000], "Battery Replacement": [4500, 4500], "Charging Port / Flex": [2500, 2500], "Dent / Body / Frame Repair": [2500, 2500] },
  "iPad Mini": { "Front Display Replacement": [7000, 7000], "Battery Replacement": [3000, 3000], "Charging Port / Flex": [1800, 1800], "Dent / Body / Frame Repair": [1800, 1800] },
  "iPad Pro 11": { "Front Display Replacement": [18000, 18000], "Battery Replacement": [5500, 5500], "Charging Port / Flex": [3000, 3000], "Dent / Body / Frame Repair": [3500, 3500] },
  "iPad Pro 12.9": { "Front Display Replacement": [22000, 22000], "Battery Replacement": [6500, 6500], "Charging Port / Flex": [3500, 3500], "Dent / Body / Frame Repair": [4000, 4000] },
  "iPhone 11": { "Front Display Replacement": [3800, 4800], "Back Glass Replacement": [2400, 2400], "Battery Replacement": [2800, 2800], "Camera Repair": [2800, 2800], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [8500, 8500] },
  "iPhone 11 Pro": { "Front Display Replacement": [8000, 9500], "Back Glass Replacement": [2800, 2800], "Battery Replacement": [3200, 3200], "Camera Repair": [4150, 4150], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [8500, 8500] },
  "iPhone 11 Pro Max": { "Front Display Replacement": [8000, 9500], "Back Glass Replacement": [2800, 2800], "Battery Replacement": [3800, 3800], "Camera Repair": [4150, 4150], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [3300, 8000] },
  "iPhone 12": { "Front Display Replacement": [9200, 9200], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [3800, 3800], "Camera Repair": [3800, 3800], "Charging Port / Flex": [3300, 3300], "Motherboard / IC Repair": [6000, 10000] },
  "iPhone 12 Pro": { "Front Display Replacement": [12600, 12600], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [3800, 3800], "Camera Repair": [5800, 5800], "Charging Port / Flex": [3800, 3800], "Motherboard / IC Repair": [7500, 10000] },
  "iPhone 12 Pro Max": { "Front Display Replacement": [16500, 16500], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [7200, 7200], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [7500, 10500] },
  "iPhone 12 mini": { "Front Display Replacement": [11800, 11800], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [4150, 4150], "Camera Repair": [4150, 4150], "Charging Port / Flex": [3300, 3300], "Motherboard / IC Repair": [6000, 9000] },
  "iPhone 13": { "Front Display Replacement": [10700, 10700], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [4150, 4150], "Camera Repair": [3800, 3800], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [8500, 10500] },
  "iPhone 13 Pro": { "Front Display Replacement": [15600, 15600], "Back Glass Replacement": [3800, 3800], "Battery Replacement": [4150, 4150], "Camera Repair": [7800, 7800], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [8500, 10500] },
  "iPhone 13 Pro Max": { "Front Display Replacement": [19700, 19700], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [7800, 7800], "Charging Port / Flex": [4200, 4200], "Motherboard / IC Repair": [9000, 12000] },
  "iPhone 13 mini": { "Front Display Replacement": [11800, 11800], "Back Glass Replacement": [3450, 3450], "Battery Replacement": [4150, 4150], "Camera Repair": [3800, 3800], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [8500, 10500] },
  "iPhone 14": { "Front Display Replacement": [11600, 11600], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [5450, 5450], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [8500, 12500] },
  "iPhone 14 Plus": { "Front Display Replacement": [15700, 15700], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [5450, 5450], "Charging Port / Flex": [4200, 4200], "Motherboard / IC Repair": [8500, 12500] },
  "iPhone 14 Pro": { "Front Display Replacement": [18600, 18600], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [8200, 8200], "Charging Port / Flex": [4850, 4850], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 14 Pro Max": { "Front Display Replacement": [20700, 20700], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4150, 4150], "Camera Repair": [8200, 8200], "Charging Port / Flex": [5800, 5800], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 15": { "Front Display Replacement": [17200, 17200], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4100, 4100], "Camera Repair": [5450, 5450], "Charging Port / Flex": [4150, 4150], "Motherboard / IC Repair": [8500, 12500] },
  "iPhone 15 Plus": { "Front Display Replacement": [18300, 18300], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5150, 5150], "Camera Repair": [5450, 5450], "Charging Port / Flex": [5250, 5250], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 15 Pro": { "Front Display Replacement": [21100, 21100], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5150, 5150], "Camera Repair": [9000, 9000], "Charging Port / Flex": [5250, 5250], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 15 Pro Max": { "Front Display Replacement": [23200, 23200], "Back Glass Replacement": [5800, 5800], "Battery Replacement": [5250, 5250], "Camera Repair": [9200, 9200], "Charging Port / Flex": [5850, 5850], "Motherboard / IC Repair": [12000, 16000] },
  "iPhone 16": { "Front Display Replacement": [18700, 18700], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4800, 4800], "Camera Repair": [5850, 5850], "Charging Port / Flex": [6200, 6200], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 16 Plus": { "Front Display Replacement": [22400, 22400], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [4800, 4800], "Camera Repair": [5850, 5850], "Charging Port / Flex": [6800, 6800], "Motherboard / IC Repair": [10500, 14500] },
  "iPhone 16 Pro": { "Front Display Replacement": [31800, 31800], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5800, 5800], "Camera Repair": [9200, 9200], "Charging Port / Flex": [6800, 6800], "Motherboard / IC Repair": [10500, 18000] },
  "iPhone 16 Pro Max": { "Front Display Replacement": [34200, 34200], "Back Glass Replacement": [5800, 5800], "Battery Replacement": [6800, 6800], "Camera Repair": [9200, 9200], "Charging Port / Flex": [8200, 8200], "Motherboard / IC Repair": [14500, 19500] },
  "iPhone 17": { "Front Display Replacement": [23300, 23300], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5500, 6500], "Camera Repair": [7200, 7200], "Charging Port / Flex": [7400, 7400], "Motherboard / IC Repair": [10500, 15500] },
  "iPhone 17 Pro": { "Front Display Replacement": [32200, 32200], "Back Glass Replacement": [3800, 3800], "Battery Replacement": [5500, 6500], "Camera Repair": [9200, 9200], "Charging Port / Flex": [7800, 7800], "Motherboard / IC Repair": [13000, 22000] },
  "iPhone 17 Pro Max": { "Front Display Replacement": [34400, 34400], "Back Glass Replacement": [3800, 3800], "Battery Replacement": [5500, 6500], "Camera Repair": [9200, 9200], "Charging Port / Flex": [7800, 7800], "Motherboard / IC Repair": [13000, 22000] },
  "iPhone 17 Slim/Air": { "Front Display Replacement": [36400, 36400], "Back Glass Replacement": [18500, 18500], "Battery Replacement": [5500, 6500], "Camera Repair": [1200, 1200], "Charging Port / Flex": [8200, 8200], "Motherboard / IC Repair": [13000, 22000] },
  "iPhone 18": { "Front Display Replacement": [24400, 24400], "Back Glass Replacement": [6800, 6800], "Battery Replacement": [5500, 6500], "Camera Repair": [10800, 10800], "Charging Port / Flex": [7800, 8200], "Motherboard / IC Repair": [12000, 18000] },
  "iPhone 18 Pro": { "Front Display Replacement": [32200, 32200], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5500, 6500], "Camera Repair": [12000, 12000], "Charging Port / Flex": [7800, 8200], "Motherboard / IC Repair": [15000, 22000] },
  "iPhone 18 Pro Max": { "Front Display Replacement": [34400, 34400], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [5500, 6500], "Camera Repair": [12000, 12000], "Charging Port / Flex": [7800, 8200], "Motherboard / IC Repair": [15000, 22000] },
  "iPhone 6": { "Front Display Replacement": [1200, 1400], "Back Glass Replacement": [999, 999], "Battery Replacement": [1450, 1450], "Camera Repair": [999, 999], "Charging Port / Flex": [1450, 1450], "Motherboard / IC Repair": [1200, 1200] },
  "iPhone 6 Plus": { "Front Display Replacement": [1200, 1600], "Back Glass Replacement": [999, 999], "Battery Replacement": [1850, 1850], "Camera Repair": [999, 999], "Charging Port / Flex": [1850, 1850], "Motherboard / IC Repair": [1200, 1200] },
  "iPhone 6s": { "Front Display Replacement": [1200, 1600], "Back Glass Replacement": [999, 999], "Battery Replacement": [1800, 1800], "Camera Repair": [999, 999], "Charging Port / Flex": [1850, 1850], "Motherboard / IC Repair": [2500, 2500] },
  "iPhone 6s Plus": { "Front Display Replacement": [1200, 1600], "Back Glass Replacement": [999, 999], "Battery Replacement": [1850, 1850], "Camera Repair": [999, 999], "Charging Port / Flex": [1850, 1850], "Motherboard / IC Repair": [3000, 3000] },
  "iPhone 7": { "Front Display Replacement": [1600, 2000], "Back Glass Replacement": [1200, 1200], "Battery Replacement": [1800, 1800], "Camera Repair": [1500, 1500], "Charging Port / Flex": [2200, 2200], "Motherboard / IC Repair": [2500, 2500] },
  "iPhone 7 Plus": { "Front Display Replacement": [1600, 2000], "Back Glass Replacement": [1200, 1200], "Battery Replacement": [2800, 2800], "Camera Repair": [1500, 1500], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [3000, 3000] },
  "iPhone 8": { "Front Display Replacement": [2000, 2500], "Back Glass Replacement": [2800, 2800], "Battery Replacement": [2300, 2300], "Camera Repair": [1800, 1800], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [3000, 3000] },
  "iPhone 8 Plus": { "Front Display Replacement": [2000, 5200], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [2800, 2800], "Camera Repair": [1800, 1800], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [3000, 3000] },
  "iPhone SE (2nd G)": { "Front Display Replacement": [1500, 4200], "Back Glass Replacement": [3150, 3150], "Battery Replacement": [3150, 3150], "Camera Repair": [1200, 1800], "Charging Port / Flex": [3800, 3800], "Motherboard / IC Repair": [7500, 7500] },
  "iPhone SE (3rd G)": { "Front Display Replacement": [1500, 5800], "Back Glass Replacement": [4150, 4150], "Battery Replacement": [3150, 3150], "Camera Repair": [1200, 1800], "Charging Port / Flex": [3800, 3800], "Motherboard / IC Repair": [7500, 7500] },
  "iPhone X": { "Front Display Replacement": [3500, 5500], "Back Glass Replacement": [2450, 2450], "Battery Replacement": [2200, 2200], "Camera Repair": [2500, 2500], "Charging Port / Flex": [2450, 2450], "Motherboard / IC Repair": [5000, 5000] },
  "iPhone XR": { "Front Display Replacement": [3500, 5500], "Back Glass Replacement": [2450, 2450], "Battery Replacement": [2800, 2800], "Camera Repair": [2500, 2500], "Charging Port / Flex": [2450, 2450], "Motherboard / IC Repair": [6000, 6000] },
  "iPhone XS": { "Front Display Replacement": [3500, 5500], "Back Glass Replacement": [2450, 2450], "Battery Replacement": [2800, 2800], "Camera Repair": [2500, 2500], "Charging Port / Flex": [2450, 2450], "Motherboard / IC Repair": [6000, 6000] },
  "iPhone XS Max": { "Front Display Replacement": [3500, 5500], "Back Glass Replacement": [2450, 2450], "Battery Replacement": [2800, 2800], "Camera Repair": [2500, 2500], "Charging Port / Flex": [2800, 2800], "Motherboard / IC Repair": [8500, 8500] },
  "iPod Classic": { "Battery Replacement": [1200, 1200], "Front Display Replacement": [1500, 1500], "Speaker / Mic / Haptics": [1200, 1200] },
  "iPod Touch 6th Gen": { "Battery Replacement": [2000, 2000], "Front Display Replacement": [2500, 2500], "Speaker / Mic / Haptics": [1500, 1500] },
  "iPod Touch 7th Gen": { "Battery Replacement": [2500, 2500], "Front Display Replacement": [3500, 3500], "Speaker / Mic / Haptics": [1800, 1800] },
};

/** Turnaround per repair type — taken from the sheet's Avg Turnaround column. */
export const TURNAROUND: Record<string, string> = {
  "Front Display Replacement": "~60 min",
  "Back Glass Replacement": "~60 min",
  "Battery Replacement": "~45 min",
  "Camera Repair": "~60 min",
  "Charging Port / Flex": "~60 min",
  "Speaker / Mic / Haptics": "~45 min",
  "Motherboard / IC Repair": "1–3 days",
  "Water Damage Revival": "24–48 hrs",
  "Software / iOS Issue": "~2 hrs",
  "Data Recovery": "1–2 days",
  "Unlocking (lawful)": "Same day",
  "OS / Firmware Installation": "~2 hrs",
  "Dent / Body / Frame Repair": "1–2 days",
  "Other / Not sure": "Diagnosis first",
};

export function priceNote(repair: string): string {
  if (repair === "Other / Not sure") return "Free diagnosis, then a fixed price before any work.";
  if (repair === "Motherboard / IC Repair" || repair === "Data Recovery") {
    return "Quoted after a free board-level diagnosis.";
  }
  if (repair === "Water Damage Revival") return "Assessed first — we tell you honestly if it is recoverable.";
  return "Genuine parts and labour included";
}

/** Look up a price. null when the sheet does not cover this combination. */
export function getPrice(model: string, repair: string): Price | null {
  const row = PRICES[model];
  if (!row) return null;
  const v = row[repair];
  return Array.isArray(v) ? v : null;
}

/** Cheapest published price for a model — used for "from ₹X". */
export function fromPrice(model: string): number | null {
  const row = PRICES[model];
  if (!row) return null;
  const mins = Object.values(row).map((v) => v[0]);
  return mins.length ? Math.min(...mins) : null;
}

/** Whole-catalogue range. */
export function priceRange(): { min: number; max: number } {
  let min = Infinity, max = 0;
  for (const row of Object.values(PRICES)) {
    for (const v of Object.values(row)) {
      if (v[0] < min) min = v[0];
      if (v[1] > max) max = v[1];
    }
  }
  return { min: min === Infinity ? 0 : min, max };
}

/** 24635 -> "₹24,635" */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

/** [24635,24635] -> "₹24,635"   [5500,6500] -> "₹5,500 – ₹6,500" */
export function priceLabel(p: Price): string {
  return p[0] === p[1] ? inr(p[0]) : `${inr(p[0])} – ${inr(p[1])}`;
}

/** Models we have any price for, grouped by device prefix. */
export function modelsFor(prefix: string): string[] {
  return Object.keys(PRICES).filter((m) => m.toLowerCase().startsWith(prefix.toLowerCase())).sort();
}
