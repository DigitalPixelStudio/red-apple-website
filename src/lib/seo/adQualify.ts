import { PRIMARY_KEYWORDS, NEGATIVE_KEYWORDS, SERVICE_AREAS } from "./adsTargeting";

export type InquiryIntent = "high-intent" | "low-intent";
export interface QualifyResult {
  intent: InquiryIntent;
  verdict: "high" | "low";
  score: number;
  matchedPositive: readonly string[];
  matchedNegative: readonly string[];
  signals: { appleDevice: boolean; faultOrService: boolean; localOrPickup: boolean; urgent: boolean; modelSpecific: boolean };
  reason: string;
}

export const QUALIFY_THRESHOLD = 65;
const DEVICE_TOKENS = ["iphone", "ipad", "macbook", "imac", "apple watch", "airpods"];
const FAULT_TOKENS = ["display", "screen", "glass", "oled", "lcd", "cracked", "shattered", "replacement", "repair", "fix", "battery", "logic board", "motherboard", "charging", "water damage", "camera"];
const URGENCY_TOKENS = ["same day", "same-day", "today", "urgent", "asap", "immediately", "right now"];
const LOCAL_TOKENS = ["bengaluru", "bangalore", "halasuru", "halasuru", "indiranagar", "domlur", "mg road", "ulsoor", "near me", "pickup", "pick up", "doorstep", "walk in"];

function normalize(value: string): string {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}
function matches(text: string, phrases: readonly string[]): string[] {
  return phrases.filter((phrase) => text.includes(normalize(phrase)));
}
function hasAny(text: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => text.includes(normalize(token)));
}

/**
 * Deterministic 0–100 lead-intent score. It is a routing signal, not a promise
 * of conversion. Negative terms hard-stop qualification; Bengaluru/local and
 * real Apple-device fault signals carry most of the weight.
 */
export function qualifyInquiry(input: unknown): QualifyResult {
  const empty = { appleDevice: false, faultOrService: false, localOrPickup: false, urgent: false, modelSpecific: false };
  if (typeof input !== "string" || !input.trim()) {
    return { intent: "low-intent", verdict: "low", score: 0, matchedPositive: [], matchedNegative: [], signals: empty, reason: "Empty inquiry; no verified repair-intent signal." };
  }

  const text = normalize(input.slice(0, 1200));
  const matchedPositive = matches(text, PRIMARY_KEYWORDS);
  const matchedNegative = matches(text, NEGATIVE_KEYWORDS);
  const signals = {
    appleDevice: hasAny(text, DEVICE_TOKENS),
    faultOrService: hasAny(text, FAULT_TOKENS),
    localOrPickup: SERVICE_AREAS.some((area) => text.includes(normalize(area))) || hasAny(text, LOCAL_TOKENS),
    urgent: hasAny(text, URGENCY_TOKENS),
    modelSpecific: /\b(iphone|ipad)\s*(1[0-9]|[0-9]{1,2})\b/.test(text) || /\bmacbook\s+(air|pro)\b/.test(text),
  };

  if (matchedNegative.length) {
    return { intent: "low-intent", verdict: "low", score: 0, matchedPositive, matchedNegative, signals, reason: `Disqualified by: ${matchedNegative.join(", ")}.` };
  }

  const deviceFault = signals.appleDevice && signals.faultOrService;
  const serviceSpecific = signals.faultOrService && /\b(display|screen|glass|oled|battery|logic board|motherboard|ic|charging|water damage|camera|repair|replacement)\b/.test(text);
  const score = Math.min(100,
    Math.min(matchedPositive.length, 5) * 8 +
    (deviceFault ? 30 : 0) +
    (signals.localOrPickup ? 15 : 0) +
    (signals.urgent ? 10 : 0) +
    (signals.modelSpecific ? 15 : 0) +
    (serviceSpecific ? 15 : 0)
  );
  const high = score >= QUALIFY_THRESHOLD;
  const evidence = [
    ...(deviceFault ? ["Apple device + fault"] : []),
    ...(signals.localOrPickup ? ["Bengaluru/local intent"] : []),
    ...(signals.urgent ? ["urgent timing"] : []),
    ...(signals.modelSpecific ? ["specific device model"] : []),
    ...(serviceSpecific ? ["specific repair service"] : []),
    ...matchedPositive.slice(0, 3),
  ];
  return {
    intent: high ? "high-intent" : "low-intent",
    verdict: high ? "high" : "low",
    score,
    matchedPositive,
    matchedNegative,
    signals,
    reason: high ? `Qualified signals: ${evidence.join(", ")}.` : "Intent score below 65; keep as soft engagement for manual review.",
  };
}

export default qualifyInquiry;