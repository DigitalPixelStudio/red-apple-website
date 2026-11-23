/**
 * Site-side lead PRE-QUALIFIER — the "background code that targets only
 * potential customers and eradicates false inquiries".
 *
 * Pure, deterministic and SSR-safe: string operations only, no window,
 * document, Date, randomness, network or secrets. Same result on server and
 * client. It reads the single-source keyword lists from adsTargeting.ts, so
 * there is no second copy to keep in sync.
 *
 * This classifies the FREE TEXT of an inbound inquiry (e.g. the note field of
 * /api/estimate, or a WhatsApp greeting) into `high-intent` vs `low-intent`
 * with an honest, explainable score. It does NOT block or route a lead by
 * itself — BE-1 owns the APIs. Backend should use the result to set a `quality`
 * flag / event property for Meta CAPI + CRM so ad delivery optimises to real
 * repair demand instead of jobs, DIY, parts shopping and curiosity taps.
 *
 * Two signal layers keep it both precise and human:
 *  1. exact single-source keyword phrases (positive boost / negative block)
 *  2. Apple device + fault + local/urgency tokens, so naturally worded real
 *     inquiries ("my iPhone 15 screen cracked today in Indiranagar") still
 *     qualify even when they do not echo a marketing phrase verbatim.
 *
 * See docs/ADS_TARGETING_SETUP.md §7 for the BE-1 integration recipe.
 */

import { PRIMARY_KEYWORDS, NEGATIVE_KEYWORDS, SERVICE_AREAS } from "./adsTargeting";

export type InquiryIntent = "high-intent" | "low-intent";

export interface QualifyResult {
  /** Coarse classification for routing / event labelling. */
  intent: InquiryIntent;
  /**
   * BE-1 compatibility alias ("high" | "low"). Their fail-open adapter
   * (src/lib/analytics/leadQuality.ts) reads `verdict` first; emitting it here
   * makes the integration deterministic instead of relying on numeric score.
   */
  verdict: "high" | "low";
  /** Honest, bounded score: -100..100. Higher = stronger genuine repair intent. */
  score: number;
  /** Distinct positive signals found (for explainability / CRM notes). */
  matchedPositive: readonly string[];
  /** Distinct disqualifying terms found (for explainability / CRM notes). */
  matchedNegative: readonly string[];
  /** Supplementary signals detected in naturally worded text. */
  signals: {
    appleDevice: boolean;
    faultOrService: boolean;
    localOrPickup: boolean;
    urgent: boolean;
  };
  /** Human-readable, factual explanation of the decision. */
  reason: string;
}

/** An exact positive keyword is worth +2, capped at 5 matches (+10). */
const POSITIVE_WEIGHT = 2;
const MAX_POSITIVE_MATCHES = 5;
/** A single disqualifying term is a hard block. */
const NEGATIVE_WEIGHT = 5;
/** Supplementary signal weights (honest, small, never outweigh a hard block). */
const DEVICE_FAULT_WEIGHT = 2;
const LOCAL_WEIGHT = 1;
const URGENCY_WEIGHT = 1;

const DEVICE_TOKENS: readonly string[] = [
  "iphone", "ipad", "ipod", "macbook", "mac", "imac", "apple watch", "watch", "airpods",
];
const FAULT_TOKENS: readonly string[] = [
  "display", "screen", "glass", "oled", "lcd", "cracked", "crack", "shattered",
  "broken", "black screen", "replacement", "repair", "fix", "battery", "flickering",
];
const URGENCY_TOKENS: readonly string[] = [
  "same day", "same-day", "today", "urgent", "asap", "immediately", "right now",
];
const LOCAL_EXTRA_TOKENS: readonly string[] = ["near me", "pickup", "pick up", "doorstep", "walk in", "drop"];

/** Minimum score for high-intent. */
export const QUALIFY_THRESHOLD = 2;

/**
 * Normalise any text to single-spaced lowercase alnum tokens wrapped in
 * spaces, so phrase checks behave like word-boundary matches and punctuation
 * (commas, hyphens, curly quotes) cannot create false hits.
 */
function normalize(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function distinctMatches(haystack: string, phrases: readonly string[]): string[] {
  const hits: string[] = [];
  for (const phrase of phrases) {
    const needle = normalize(phrase);
    if (haystack.includes(needle) && !hits.includes(phrase)) hits.push(phrase);
  }
  return hits;
}

function hasToken(haystack: string, token: string): boolean {
  return haystack.includes(normalize(token));
}

/**
 * Classify an inbound inquiry's free text.
 *
 * @param text - raw inquiry text (estimate note, WhatsApp greeting, etc.)
 * @returns QualifyResult — intent, bounded score, matched terms, plain reason.
 */
export function qualifyInquiry(text: unknown): QualifyResult {
  const empty: QualifyResult["signals"] = {
    appleDevice: false, faultOrService: false, localOrPickup: false, urgent: false,
  };

  if (typeof text !== "string" || text.trim().length === 0) {
    return {
      intent: "low-intent",
      verdict: "low",
      score: 0,
      matchedPositive: [],
      matchedNegative: [],
      signals: empty,
      reason: "Empty or invalid inquiry text; no intent signal.",
    };
  }

  const haystack = normalize(text);
  const matchedPositive = distinctMatches(haystack, PRIMARY_KEYWORDS);
  const matchedNegative = distinctMatches(haystack, NEGATIVE_KEYWORDS);

  const signals = {
    appleDevice: DEVICE_TOKENS.some((token) => hasToken(haystack, token)),
    faultOrService: FAULT_TOKENS.some((token) => hasToken(haystack, token)),
    localOrPickup:
      SERVICE_AREAS.some((zone) => hasToken(haystack, zone)) ||
      LOCAL_EXTRA_TOKENS.some((token) => hasToken(haystack, token)),
    urgent: URGENCY_TOKENS.some((token) => hasToken(haystack, token)),
  };
  const deviceFault = signals.appleDevice && signals.faultOrService;

  // Hard block: jobs, DIY, parts-only, fake-authority, competitor brands,
  // remote/free intent — exactly the false inquiries we must kill.
  if (matchedNegative.length > 0) {
    const score = Math.max(
      -100,
      matchedPositive.length * POSITIVE_WEIGHT - matchedNegative.length * NEGATIVE_WEIGHT,
    );
    return {
      intent: "low-intent",
      verdict: "low",
      score,
      matchedPositive,
      matchedNegative,
      signals,
      reason: `Blocked by disqualifying term(s): ${matchedNegative.join(", ")}.`,
    };
  }

  // Neither a known phrase nor a device+fault pair = no credible repair intent.
  if (matchedPositive.length === 0 && !deviceFault) {
    return {
      intent: "low-intent",
      verdict: "low",
      score: 0,
      matchedPositive,
      matchedNegative,
      signals,
      reason: "No recognised Apple-device repair intent signal; manual review.",
    };
  }

  const score = Math.min(
    100,
    Math.min(matchedPositive.length, MAX_POSITIVE_MATCHES) * POSITIVE_WEIGHT +
      (deviceFault ? DEVICE_FAULT_WEIGHT : 0) +
      (signals.localOrPickup ? LOCAL_WEIGHT : 0) +
      (signals.urgent ? URGENCY_WEIGHT : 0),
  );

  if (score < QUALIFY_THRESHOLD) {
    return {
      intent: "low-intent",
      verdict: "low",
      score,
      matchedPositive,
      matchedNegative,
      signals,
      reason: "Intent signal below threshold; manual review.",
    };
  }

  const evidence = [
    ...matchedPositive,
    ...(deviceFault ? ["Apple device + fault/service"] : []),
    ...(signals.localOrPickup ? ["local/pickup intent"] : []),
    ...(signals.urgent ? ["urgency"] : []),
  ];
  return {
    intent: "high-intent",
    verdict: "high",
    score,
    matchedPositive,
    matchedNegative,
    signals,
    reason: `High-intent signals: ${evidence.join(", ")}. No disqualifying terms.`,
  };
}

export default qualifyInquiry;
