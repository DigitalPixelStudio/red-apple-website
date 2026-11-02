export type KnowledgeDocument = {
  id: string;
  title: string;
  tags: string[];
  content: string;
};

/**
 * Curated, version-controlled knowledge for Pixel Ai.
 * Update this file alongside the approved repair policy and pricing workbook.
 * The API retrieves only the most relevant chunks for each customer question.
 */
export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "shop-profile",
    title: "Shop profile, location and opening hours",
    tags: ["shop", "address", "location", "hours", "timing", "Halasuru", "MG Road", "metro", "Bengaluru", "Bangalore"],
    content: "Red Apple Mobile Repair Store is an independent Apple-device repair workshop at No. 1, Mahatma Gandhi Road, opposite Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008. It is about one minute from Halasuru Metro. Opening hours are 10:00 AM to 12:00 AM, all seven days. Walk-ins are welcome. The workshop is independent and is not an Apple Authorised Service Provider."
  },
  {
    id: "device-coverage",
    title: "Supported devices and repair services",
    tags: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook", "Mac", "iPod", "screen", "display", "battery", "camera", "charging", "speaker", "microphone", "motherboard", "water", "software", "repair"],
    content: "The workshop services iPhone, iPad, Apple Watch, AirPods, iPod and MacBook/Mac devices. Repair categories include front display replacement, back glass replacement, battery replacement, camera repair, charging port and flex repair, speaker/microphone/haptics, motherboard and IC-level work, water-damage assessment, software and iOS issues, data recovery, lawful unlocking, OS/firmware installation and body/frame repair. Exact model and fault must be confirmed before quoting."
  },
  {
    id: "diagnosis-and-quote",
    title: "Free diagnosis, approval and payment",
    tags: ["diagnosis", "inspection", "quote", "estimate", "payment", "advance", "UPI", "cash", "card", "refund"],
    content: "Diagnosis is free. The technician inspects the device and gives a fixed quote before work begins. The customer approves the quote before repair or payment. No advance payment is required. UPI, card and cash are accepted. If the device cannot be repaired, the customer is not charged for the failed repair attempt."
  },
  {
    id: "warranty-policy",
    title: "Repair warranty and battery/display health cover",
    tags: ["warranty", "guarantee", "90 days", "battery health", "display", "screen", "impact", "liquid", "policy"],
    content: "Repairs carry a 90-day service warranty. Battery and display work also has six months of health cover under the stated policy. Battery health falling below 80% or a non-impact display fault may qualify for one replacement under policy. New impact damage, liquid damage and third-party repair are excluded. The customer should retain the repair invoice and contact the store for a warranty assessment."
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
    tags: ["time", "duration", "turnaround", "same day", "minutes", "hours", "days", "screen", "battery", "board", "water", "data recovery", "iPad"],
    content: "Typical turnaround from the approved repair guide: front display about 60 minutes; back glass about 60 minutes; battery about 45 minutes; camera about 60 minutes; charging port/flex about 60 minutes; speaker/mic/haptics about 45 minutes; motherboard/IC work 1–3 days; water-damage work 24–48 hours; software/iOS about 2 hours; data recovery 1–2 days; lawful unlocking same day; OS/firmware installation about 2 hours; body/frame repair 1–2 days. Parts availability and diagnosis can change timing, so do not promise a completion time."
  },
  {
    id: "water-damage",
    title: "Water damage safety and assessment",
    tags: ["water", "liquid", "wet", "paani", "geela", "spill", "charge", "heat", "corrosion"],
    content: "For a water-damaged device, tell the customer not to charge it and not to apply heat. Recommend a prompt free assessment. Water-damage treatment may take 24–48 hours, but recovery or successful repair is never guaranteed before diagnosis."
  },
  {
    id: "data-recovery",
    title: "Data recovery scope and limitations",
    tags: ["data recovery", "photos", "contacts", "files", "backup", "dead phone", "water damage", "recovery"],
    content: "Data recovery starts at ₹2,999 and the assessment is free. The technician first checks whether the data is reachable. Recovery is not guaranteed and no success promise should be made before assessment. Do not ask for account credentials or passwords."
  },
  {
    id: "activation-lock",
    title: "Activation Lock and lawful unlocking",
    tags: ["iCloud", "Activation Lock", "unlock", "bypass", "carrier", "network lock", "ownership"],
    content: "Never offer to bypass iCloud Activation Lock or defeat device security. Refuse briefly and respectfully. Carrier/network unlocking may be discussed only through a lawful process and with proof of ownership."
  },
  {
    id: "bulk-and-insurance",
    title: "Corporate, bulk and insurance enquiries",
    tags: ["bulk", "B2B", "corporate", "school", "office", "multiple devices", "insurance", "GST invoice", "damage report"],
    content: "Enquiries for five or more devices should be handed to the owner or a technician for a written custom quote. The workshop can provide an itemised GST invoice and a written damage report for an insurance claim, but it does not file the claim on the customer's behalf."
  },
  {
    id: "human-escalation",
    title: "Human technician escalation and complaints",
    tags: ["human", "technician", "agent", "complaint", "refund", "damage", "repeat repair", "legal", "staff"],
    content: "Escalate to a human technician when requested, when a customer reports damage or a repeat failure, asks for a refund, raises a complaint or legal concern, or when the assistant cannot answer after a clarification. Apologise once, avoid arguing or speculating, and offer WhatsApp with a concise conversation summary. Never claim a human has responded until they actually do."
  }
];