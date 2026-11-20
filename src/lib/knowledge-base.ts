import { GLASS_PRICE_ROWS, GLASS_PRICE_MIN, GLASS_PRICE_MAX, GLASS_WARRANTY_MONTHS } from "./glass-pricing";

export type KnowledgeDocument = {
  id: string;
  title: string;
  tags: string[];
  content: string;
};

const GLASS_PRICE_SENTENCE = GLASS_PRICE_ROWS
  .map((row) => row.model + " ₹" + row.price.toLocaleString("en-IN"))
  .join("; ");

/**
 * Curated, version-controlled knowledge for Pixel Ai.
 * Update this file alongside the approved repair policy and pricing workbook.
 * The API retrieves only the most relevant chunks for each customer question.
 */
export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "shop-profile",
    title: "Shop profile, location and opening hours",
    tags: ["shop", "address", "location", "hours", "timing", "Halasuru", "MG Road", "metro", "Bengaluru", "Bangalore", "verified address", "Google My Business", "GMB", "Google reviews", "rating"],
    content: "Red Apple Mobile Repair Store is an independent Apple-device repair workshop at Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. to Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008. This is the Google My Business & Maps Verified Address (https://share.google/EinJlCF6U63xVQhgI). It is about one minute from Halasuru Metro. Rated 4.9 from 1,103 Google reviews. Opening hours are 10:00 AM to 12:00 AM, all seven days. Walk-ins are welcome. The workshop is independent and is not an Apple Authorised Service Provider."
  },
  {
    id: "device-coverage",
    title: "Supported devices and repair services",
    tags: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook", "Mac", "iPod", "screen", "display", "battery", "camera", "charging", "speaker", "microphone", "motherboard", "water", "software", "repair"],
    content: "The workshop services iPhone, iPad, Apple Watch, AirPods, iPod and MacBook/Mac devices. Repair categories include front glass restoration, front display replacement, back glass replacement, battery replacement, camera repair, charging port and flex repair, speaker/microphone/haptics, motherboard and IC-level work, water-damage assessment, software and iOS diagnostics, signed firmware restore, board-level storage IC repair, owner-verified factory restore assistance and body/frame repair. Exact model and fault must be confirmed before quoting."
  },
  {
    id: "front-glass-restoration",
    title: "Front Glass Restoration versus full display replacement",
    tags: ["front glass", "glass restoration", "glass only", "front glass replacement", "outer glass", "touch layer", "display", "screen", "OLED", "cracked glass"],
    content: "Front Glass Restoration is a separate service from Front Display Replacement. It applies when the original display/OLED assembly is still suitable and only the front glass or touch layer is damaged. The technician inspects the device first and confirms eligibility; if the display itself is damaged, full display replacement is recommended instead. Front Glass Restoration carries a 6 Months hardware warranty, subject to the stated repair warranty terms, and does not cover new impact or liquid damage. A published glass price exists for listed iPhone models, but eligibility is always confirmed on inspection."
  },
  {
    id: "glass-restoration-prices",
    title: "Published front glass restoration prices by iPhone model",
    tags: ["front glass price", "glass restoration price", "glass only price", "screen glass price", "cracked glass price", "iPhone glass", "price list", "pricing", "cost", "quote", "OCA", "lamination"],
    content: "Front glass restoration published prices, in rupees: " + GLASS_PRICE_SENTENCE + ". The published range is ₹" + GLASS_PRICE_MIN.toLocaleString("en-IN") + " to ₹" + GLASS_PRICE_MAX.toLocaleString("en-IN") + ". These are glass-only restoration prices, not full display replacement. A model not on this list has no published glass price and must be quoted after a free inspection. Every glass restoration carries a " + GLASS_WARRANTY_MONTHS + "-month hardware warranty. Eligibility depends on the existing OLED/display being suitable; if the display itself is damaged, quote full display replacement instead."
  },
  {
    id: "glass-lab-machinery",
    title: "TBK glass restoration machinery and process",
    tags: ["machinery", "machines", "TBK", "OCA", "laminating", "vacuum", "hydraulic press", "bubble remover", "autoclave", "chamber", "laser", "UV laser", "cold laser", "purple laser", "TBK-958", "90 litre", "bezel", "lamination", "factory finish", "OLED"],
    content: "Front glass restoration is performed on three specialised TBK systems at the Halasuru lab. (1) TBK OCA Laminating Vacuum Compressed Hydraulic Press: aligns and bonds the new glass to the original OLED under vacuum and controlled hydraulic pressure for factory-level optical lamination. (2) TBK 90-Litre High-Pressure Bubble Remover Chamber: removes microscopic air bubbles and cures the OCA for a crystal-clear, zero-defect finish with permanent adhesion. (3) TBK-958 Cold UV Purple Laser: separates the front bezel and removes back glass with low-temperature UV laser precision, so the logic board and internal components receive no thermal stress. The process preserves the original OLED panel and touch sensitivity wherever the display is suitable. All post-repair work uses Precision TBK Lab Equipment & Signed Restore Workflows under a Sealed Zero-Passcode Bench Workflow (Passcode Never Requested): the customer is never asked for a passcode, Apple ID, OTP, UPI PIN or card details."
  },
  {
    id: "diagnosis-and-quote",
    title: "Free diagnosis, approval and payment",
    tags: ["diagnosis", "inspection", "quote", "estimate", "payment", "advance", "UPI", "cash", "card", "refund"],
    content: "Diagnosis is free. The technician inspects the device and gives a fixed quote before work begins. The customer approves the quote before repair or payment. No advance payment is required. UPI, card and cash are accepted. If the device cannot be repaired, the customer is not charged for the failed repair attempt."
  },
  {
    id: "warranty-policy",
    title: "6 Months repair warranty, invoice and exclusions",
    tags: ["warranty", "guarantee", "6 Months", "6 Months", "invoice", "warranty record", "claim", "display", "battery", "glass", "motherboard", "exclusions", "impact", "liquid", "policy"],
    content: "Every repair carries a 6 Months warranty: repair work, parts we replaced, displays, batteries and glass are all covered. Motherboard repairs are the only exclusion. The invoice is the warranty record — bring the invoice and the device, or WhatsApp the invoice number and photos, and we handle the diagnosis and the covered repair on that same invoice within 6 Months. Exclusions are explicit: physical/impact damage after hand-back, liquid damage after hand-back, repair or opening by another shop after us, accidental damage, normal wear and tear, misuse, cosmetic issues, and unrelated software faults. Never quote any shorter warranty period or the old address."
  },
  {
    id: "warranty-claim",
    title: "How to claim the 6 Months warranty with your invoice",
    tags: ["warranty claim", "claim", "invoice number", "photos", "6 Months", "6 Months", "diagnosis", "same invoice", "exclusions", "motherboard", "proof of repair"],
    content: "To claim under the 6 Months repair warranty, bring your invoice and the device to the store, or message us on WhatsApp at +91 86606 63776 with the invoice number and clear photos of the fault. We re-diagnose the device and, if the fault is covered, carry out the repair on the same invoice at no extra charge. The invoice is the only warranty record we need; motherboard repairs are excluded. A claim is not covered for physical/impact or liquid damage after hand-back, a repair or opening by another shop after us, accidental damage, normal wear and tear, misuse, cosmetic issues, or unrelated software faults."
  },
  {
    id: "crm-whatsapp-updates",
    title: "CRM repair stage updates on WhatsApp for walk-in and pickup devices",
    tags: ["CRM", "WhatsApp", "stage", "status", "repair status", "update", "tracking", "walk-in", "pickup", "doorstep", "job card", "handover", "delivered"],
    content: "Every repair is logged as a job card in our CRM. Walk-in customers and doorstep-pickup customers receive WhatsApp stage updates as the device moves through received, free diagnosis, approved repair, quality check, ready for hand-back and delivered. The CRM tracked invoice is generated from the same CRM record and sent on WhatsApp. The assistant cannot confirm or invent a stage; direct the customer to the repair-status page or WhatsApp for the live status."
  },
  {
    id: "privacy-and-data",
    title: "Customer privacy, passcodes and data handling",
    tags: ["privacy", "data", "passcode", "password", "Apple ID", "OTP", "UPI PIN", "card", "wipe", "backup", "security"],
    content: "Never ask customers to share a device passcode, Apple ID or password, OTP, UPI PIN, card number or other account credentials. Customers should not send these details in chat or WhatsApp. The workshop does not browse customer content. No data is wiped without the customer's prior written permission. If testing requires an unlocked device, the customer can unlock it in person."
  },
  {
    id: "parts-and-independence",
    title: "Parts quality and independent repair status",
    tags: ["parts", "OEM", "genuine", "original", "Apple authorised", "independent", "quality"],
    content: "Red Apple is an independent repair workshop, not affiliated with, authorised by or endorsed by Apple Inc. Parts are described accurately as OEM-grade or genuine only when the specific part has been verified as genuine. Never describe an OEM-grade part as an original Apple part. Explain available part-grade options and the price before work starts."
  },
  {
    id: "pickup-and-delivery",
    title: "Doorstep pickup and delivery",
    tags: ["pickup", "pick up", "doorstep", "home", "collection", "delivery", "rider", "Bengaluru", "Bangalore"],
    content: "Doorstep pickup operates 24 hours a day, seven days a week across Bengaluru. Pickup is free for repairs above ₹2,999. A rider collects the device and it is returned after repair and testing. The chatbot must not claim a pickup has been booked or a rider assigned; customers should use the pickup form or WhatsApp for confirmation."
  },
  {
    id: "turnaround",
    title: "Typical repair turnaround times",
    tags: ["time", "duration", "turnaround", "same day", "minutes", "hours", "days", "screen", "battery", "board", "water", "storage IC repair", "iPad"],
    content: "Typical turnaround from the approved repair guide: front display about 60 minutes; back glass about 60 minutes; battery about 45 minutes; camera about 60 minutes; charging port/flex about 60 minutes; speaker/mic/haptics about 45 minutes; motherboard/IC work 2–3 days; water-damage work 24–48 hours; software/iOS diagnostics and signed restore about 2 hours; board-level storage IC repair 1–2 days; owner-verified factory restore assistance same day; OS/firmware installation about 2 hours; body/frame repair 1–2 days. Parts availability and diagnosis can change timing, so do not promise a completion time."
  },
  {
    id: "water-damage",
    title: "Water damage safety and assessment",
    tags: ["water", "liquid", "wet", "paani", "geela", "spill", "charge", "heat", "corrosion"],
    content: "For a water-damaged device, tell the customer not to charge it and not to apply heat. Recommend a prompt free assessment. Water-damage treatment may take 24–48 hours, but recovery or successful repair is never guaranteed before diagnosis."
  },
  {
    id: "data-recovery",
    title: "Board-level storage IC repair scope and limitations",
    tags: ["storage IC repair", "storage IC", "photos", "contacts", "files", "backup", "dead phone", "water damage", "board-level"],
    content: "Board-level storage IC repair starts at ₹2,999 and the assessment is free. The technician first checks the storage hardware and whether the data is reachable. A data outcome is never promised before assessment. Do not ask for account credentials or passwords."
  },
  {
    id: "activation-lock",
    title: "Activation Lock and owner-verified restore",
    tags: ["iCloud", "Activation Lock", "factory restore", "circumvent", "carrier", "network lock", "ownership"],
    content: "Never offer to circumvent iCloud Activation Lock or defeat device security. Refuse briefly and respectfully. Owner-verified factory restore assistance may be discussed only with proof of ownership; never offer a security circumvention."
  },
  {
    id: "bulk-and-insurance",
    title: "Corporate, bulk and insurance enquiries",
    tags: ["bulk", "B2B", "corporate", "school", "office", "multiple devices", "insurance", "CRM tracked invoice", "damage report"],
    content: "Enquiries for five or more devices should be handed to the owner or a technician for a written custom quote. The workshop can provide an itemised CRM tracked invoice and a written damage report for an insurance claim, but it does not file the claim on the customer's behalf."
  },
  {
    id: "human-escalation",
    title: "Human technician escalation and complaints",
    tags: ["human", "technician", "agent", "complaint", "refund", "damage", "repeat repair", "legal", "staff"],
    content: "Escalate to a human technician when requested, when a customer reports damage or a repeat failure, asks for a refund, raises a complaint or legal concern, or when the assistant cannot answer after a clarification. Apologise once, avoid arguing or speculating, and offer WhatsApp with a concise conversation summary. Never claim a human has responded until they actually do."
  }
];