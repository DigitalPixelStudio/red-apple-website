/**
 * FAIL-OPEN adapter for the OPTIONAL ad-qualification hook (RES-1 workstream:
 * src/lib/seo/adQualify.ts — `qualifyInquiry(text)`).
 *
 * Why an adapter instead of a direct import:
 *   - The qualifier is an OPTIONAL enhancement. It must never be able to fail a
 *     build, throw in a request, or slow down lead capture.
 *   - The specifier is parameterised (`@/lib/seo/${name}`), so the bundler creates
 *     a lazy context instead of a hard module dependency. If the module is absent,
 *     the promise rejects and the `catch` simply omits the field.
 *
 * No PII is stored here: only a coarse verdict + a short reason are returned and
 * attached to the JSON response. The original text is never logged or persisted.
 */

export type LeadQuality = {
  /** Coarse classification only — "medium"/"unknown" are folded into "low". */
  verdict: "high" | "low";
  /** Short, human-readable reason (bounded to 160 chars). */
  reason: string;
};

type QualifierModule = {
  qualifyInquiry?: (text: string) => unknown;
  default?: { qualifyInquiry?: (text: string) => unknown };
};

const loadQualifier = (name: string): Promise<QualifierModule> =>
  import(`@/lib/seo/${name}`) as Promise<QualifierModule>;

/** Shape-agnostic normaliser: never fabricates a verdict it cannot recognise. */
function normalise(result: unknown): LeadQuality | undefined {
  if (typeof result === "string") {
    const v = result.trim().toLowerCase();
    if (v === "high" || v === "low") return { verdict: v, reason: "keyword_signal" };
    return undefined;
  }
  if (!result || typeof result !== "object") return undefined;

  const o = result as Record<string, unknown>;
  // RES-1's QualifyResult emits `intent` ("high-intent"/"low-intent") and a bounded
  // numeric `score`; `verdict` is the documented compatibility alias. Accept all
  // three so the integration stays correct even if one field is omitted.
  const raw = o.verdict ?? o.quality ?? o.intent ?? o.label ?? o.result ?? o.tier;
  let verdict: LeadQuality["verdict"] | undefined;

  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (v === "high" || v === "high-intent") verdict = "high";
    else if (v === "low" || v === "low-intent" || v === "medium" || v === "unknown") verdict = "low";
  } else if (typeof raw === "boolean") {
    verdict = raw ? "high" : "low";
  } else if (typeof raw === "number" && Number.isFinite(raw)) {
    verdict = raw >= 2 ? "high" : "low"; // RES-1 QUALIFY_THRESHOLD = 2
  }
  // Last resort: the bounded numeric score (never fabricates a verdict if absent).
  if (!verdict && typeof o.score === "number" && Number.isFinite(o.score)) {
    verdict = o.score >= 2 ? "high" : "low";
  }
  if (!verdict) return undefined;

  const reasonRaw = o.reason ?? o.why ?? o.detail ?? o.message ?? o.explanation ?? o.note;
  const reason =
    typeof reasonRaw === "string" && reasonRaw.trim()
      ? reasonRaw.trim().slice(0, 160)
      : "heuristic_signal";
  return { verdict, reason };
}

/**
 * Score a free-text inquiry. Returns `undefined` (field omitted) on ANY doubt:
 * missing module, unexpected return shape, or a thrown error. Fail-open by design.
 */
export async function qualifyOptional(
  text: string | null | undefined
): Promise<LeadQuality | undefined> {
  const clean = typeof text === "string" ? text.trim().slice(0, 500) : "";
  if (!clean) return undefined;
  try {
    const mod = await loadQualifier("adQualify");
    const fn =
      typeof mod?.qualifyInquiry === "function"
        ? mod.qualifyInquiry
        : typeof mod?.default?.qualifyInquiry === "function"
          ? mod.default.qualifyInquiry
          : null;
    if (!fn) return undefined;
    return normalise(fn(clean));
  } catch {
    return undefined;
  }
}

/** Attach `leadQuality` only when a verdict exists — otherwise leave the body untouched. */
export function withLeadQuality<T extends Record<string, unknown>>(
  body: T,
  quality: LeadQuality | undefined
): T & { leadQuality?: LeadQuality } {
  return quality ? { ...body, leadQuality: quality } : body;
}
