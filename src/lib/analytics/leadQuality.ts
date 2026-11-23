import { QUALIFY_THRESHOLD, qualifyInquiry } from "@/lib/seo/adQualify";

export type LeadQuality = {
  verdict: "high" | "low";
  score: number;
  reason: string;
  eventName: "QualifiedAppleLead" | "SoftEngage";
  value: number;
  currency: "INR";
};

function estimateLeadValue(text: string): number {
  const value = text.toLowerCase();
  if (/macbook|logic board|motherboard|chip level|ic repair/.test(value)) return 16_000;
  if (/display|oled|screen replacement/.test(value)) return 8_500;
  if (/front glass|back glass|glass restoration/.test(value)) return 6_500;
  if (/ipad/.test(value)) return 7_000;
  if (/battery|charging/.test(value)) return 4_500;
  return 5_000;
}

/** Fail-open, deterministic lead classification. The score is retained end-to-end. */
export async function qualifyOptional(text: string | null | undefined): Promise<LeadQuality | undefined> {
  const clean = typeof text === "string" ? text.trim().slice(0, 1200) : "";
  if (!clean) return undefined;
  try {
    // The business is Bengaluru-based; local intent is supplied by the site context,
    // while explicit device/service signals still determine the score.
    const result = qualifyInquiry(`${clean} Bengaluru`);
    const high = result.score >= QUALIFY_THRESHOLD;
    return {
      verdict: high ? "high" : "low",
      score: result.score,
      reason: result.reason.slice(0, 160),
      eventName: high ? "QualifiedAppleLead" : "SoftEngage",
      value: high ? estimateLeadValue(clean) : 0,
      currency: "INR",
    };
  } catch {
    return undefined;
  }
}

export function withLeadQuality<T extends Record<string, unknown>>(
  body: T,
  quality: LeadQuality | undefined
): T & { leadQuality?: LeadQuality } {
  return quality ? { ...body, leadQuality: quality } : body;
}