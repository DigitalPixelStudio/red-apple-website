export type Attribution = {
  gclid?: string; fbclid?: string; msclkid?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string;
};

const STORAGE_KEY = "red-apple:utm-session:v1";
const KEYS: readonly (keyof Attribution)[] = [
  "gclid", "fbclid", "msclkid", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term",
];

function readStored(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch { return {}; }
}

/** Capture first-touch attribution for this browser tab; newer explicit IDs win. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const current = readStored();
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const key of KEYS) {
    const value = params.get(key)?.trim();
    if (value) { current[key] = value.slice(0, 512); changed = true; }
  }
  if (changed) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* private mode */ }
  }
  return current;
}

export function getAttribution(): Attribution {
  captureAttribution();
  return readStored();
}

export function getAttributionRef(): string {
  const a = getAttribution();
  const refs = [
    a.gclid ? `gclid=${a.gclid}` : "",
    a.fbclid ? `fbclid=${a.fbclid}` : "",
    a.msclkid ? `msclkid=${a.msclkid}` : "",
  ].filter(Boolean);
  return refs.length ? `Ref: ${refs.join(" | ")}`.slice(0, 700) : "";
}