export const SITE = {
  name: "Red Apple Mobile Repair Store",
  legalName: "RED APPLE MOBILE REPAIR STORE",
  shortName: "Red Apple",
  tagline: "Apple Device Repairs, Perfected.",
  shortDescription:
    "Bengaluru's specialist Apple repair studio in Halasuru. iPhone, iPad, AirPods, Apple Watch, MacBook & Mac repairs — Component-Level Micro-Soldering, OEM Displays & Front-Glass Restoration on TBK machinery, backed by a 6-month repair warranty.",
  phone: "+918660663776",
  phoneHref: "tel:+918660663776",
  whatsapp: "918660663776",
  email: "support@redmobilerepair.in",
  address:
    "Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. to Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008",
  addressVerified: "Google My Business & Maps Verified Address",
  area: "Halasuru, Bengaluru",
  city: "Bengaluru",
  pincode: "560008",
  state: "Karnataka",
  country: "IN",
  hours: "10 AM – 12 AM midnight (Open all 7 days)",
  hoursSchema: "Mo-Su 10:00-23:59",
  pickupHours: "24/7 — doorstep pickup any hour, any day",
  openTime: "10:00",
  closeTime: "23:59",
  geo: { lat: 12.9748, lng: 77.6249 },
  rating: "4.9",
  ratingCount: "1,103",
  yearsActive: "9+",
  warrantyMonths: "6",
  warrantyLabel: "6 Months",
  warrantyNote:
    "6-month repair service warranty on all repairs, displays, batteries and glass work — motherboard repairs are excluded. Claims are made with your repair invoice.",
  avgRepairTime: "30",
  placeId: "ChIJmY-X9asXrjsRCLyeUhrkrfk",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Red+Apple+Mobile+Repair+Store+Halasuru+Bengaluru&query_place_id=ChIJmY-X9asXrjsRCLyeUhrkrfk",
  mapsReviewUrl: "https://share.google/EinJlCF6U63xVQhgI",
  mapsEmbed:
    "https://www.google.com/maps?q=Metro+Pillar+No+125%2C+No.38%2C+next+to+Vignesh+Dresses%2C+Halasuru%2C+Bengaluru+560008&z=17&output=embed",
  gmbUrl: "https://share.google/EinJlCF6U63xVQhgI",
  justdialUrl: "https://www.justdial.com/Bengaluru/Red-Apple-Mobile-Repair-Store-Halasuru",
  youtubeUrl: "https://www.youtube.com/@RedAppleMobileRepairStore",
  facebookUrl: "https://www.facebook.com/RedAppleMobileRepairStore",
  instagramUrl: "https://www.instagram.com/RedAppleMobileRepairStore",
  telegramUrl: "https://t.me/RedAppleMobileRepairStore",
  appleMapsUrl:
    "https://maps.apple.com/?q=Red+Apple+Mobile+Repair+Store+Halasuru+Bengaluru",
  bingPlacesUrl:
    "https://www.bing.com/maps?q=Red+Apple+Mobile+Repair+Store+Halasuru+Bengaluru",
  xUrl: "",
} as const;

export const baseUrl = "https://www.redmobilerepair.in";

type SocialLink = {
  label: string;
  icon: string;
  href: string;
  short?: string;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "Instagram", icon: "instagram", href: SITE.instagramUrl },
  { label: "Facebook", icon: "facebook", href: SITE.facebookUrl },
  { label: "YouTube", icon: "youtube", href: SITE.youtubeUrl },
  { label: "X (Twitter)", icon: "twitter", href: SITE.xUrl },
  { label: "Telegram", icon: "telegram", href: SITE.telegramUrl },
  { label: "Google Business Profile / Maps", icon: "gmb", href: SITE.gmbUrl },
  { label: "JustDial", icon: "store", href: SITE.justdialUrl, short: "JD" },
  { label: "Apple Maps", icon: "pin", href: SITE.appleMapsUrl },
  { label: "Bing Places", icon: "location", href: SITE.bingPlacesUrl },
];

export const wa = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

// ---------- Apple ecosystem device families ----------
export const DEVICE_FAMILIES = [
  { id: "iphone", name: "iPhone", icon: "phone", tag: "All models", desc: "Displays, batteries, cameras, back glass & full hardware service.", img: "/images/v5/iphone-pro-max-burgundy.jpg" },
  { id: "ipad", name: "iPad", icon: "ipad", tag: "All models", desc: "iPad, iPad Pro, iPad Air & iPad mini — screens, battery & logic.", img: "/images/v5/ipad-pro-129.jpg" },
  { id: "watch", name: "Apple Watch", icon: "watch", tag: "All series", desc: "Screens, batteries, sensors & straps across all Watch series.", img: "/images/v5/service-watch.jpg" },
  { id: "airpods", name: "AirPods", icon: "airpods", tag: "All generations", desc: "Battery, charging case, speaker & microphone repair.", img: "/images/v5/service-airpods.jpg" },
  { id: "macbook", name: "MacBook", icon: "macbook", tag: "Pro · Air · Mini", desc: "MacBook Pro, Air, Mac mini & iMac — display, battery, board.", img: "/images/v5/service-macbook.jpg" },
  { id: "software", name: "Software & Recovery", icon: "wrench", tag: "iOS · macOS · firmware", desc: "System diagnostics, signed firmware restore, boot loops and board-level storage IC repair.", img: "/images/v5/motherboard-macro.jpg" },
] as const;

// ---------- Devices for the quote engine ----------
export const QUOTE_DEVICES = [
  {
    id: "iphone", label: "iPhone",
    models: ["iPhone 18 Pro Max", "iPhone 18 Pro", "iPhone 18 Plus", "iPhone 18", "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17 Plus", "iPhone 17", "iPhone Air", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
      "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
      "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
      "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13 mini", "iPhone 13",
      "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12 mini", "iPhone 12",
      "iPhone SE (3rd Gen)", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
      "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
      "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7", "Older iPhone"],
  },
  {
    id: "ipad", label: "iPad",
    models: ["iPad Pro (M4)", "iPad Pro (M2)", "iPad Air (M2)", "iPad Air 5", "iPad Air 4",
      "iPad 10", "iPad 9", "iPad mini 6", "iPad mini 5", "Older iPad"],
  },
  {
    id: "watch", label: "Apple Watch",
    models: ["Apple Watch Ultra 3", "Apple Watch Ultra 2", "Apple Watch Ultra", "Apple Watch Series 10", "Series 9",
      "Series 8", "Series 7", "Series 6", "SE (2nd Gen)", "Series 5", "Older Watch"],
  },
  {
    id: "airpods", label: "AirPods",
    models: ["AirPods Pro 2", "AirPods Pro 1", "AirPods 4", "AirPods 3", "AirPods 2",
      "AirPods Max", "AirPods Case Only"],
  },
  {
    id: "macbook", label: "Mac & MacBook",
    models: ["MacBook Pro 16\" (M3/M4)", "MacBook Pro 14\" (M3/M4)", "MacBook Pro 13\" (M2)",
      "MacBook Air 15\" (M3)", "MacBook Air 13\" (M2/M3)", "Mac mini", "iMac", "Mac Studio", "Other Mac"],
  },
  { id: "other", label: "Other Apple Device", models: ["Apple TV", "Magic Keyboard", "Trackpad / Mouse", "Battery / Accessory", "Not sure — show me at store"] },
] as const;

export const REPAIR_TYPES = [
  "Front Glass Restoration",
  "Front Display Replacement",
  "Back Glass Replacement",
  "Battery Replacement",
  "Camera Repair",
  "Charging Port / Flex",
  "Speaker / Mic / Haptics",
  "Motherboard / IC Repair",
  "Water Damage Revival",
  "Software / iOS Issue",
  "Board-Level Storage IC Repair",
  "Owner-Verified Factory Restore Assistance",
  "System Diagnostics & Signed Firmware Restore",
  "Dent / Body / Frame Repair",
  "Other / Not sure",
] as const;

// ---------- Core services ----------
export const SERVICES: {
  id: string; title: string; icon: string; desc: string; time: string;
  devices: string; featured?: boolean; points: string[]; img: string;
}[] = [
  {
    id: "display", title: "Front Display Replacement", icon: "display",
    desc: "OLED-grade panels with True Tone, installed in ~45 minutes while you wait.",
    time: "~45 min", devices: "iPhone · iPad · MacBook",
    featured: true, img: "/images/v5/display-panel.jpg",
    points: ["True Tone preserved", "OEM-grade panel", "6-month warranty"],
  },
  {
    id: "frontglass", title: "Front Glass Restoration", icon: "display",
    desc: "For devices where the original display/OLED is still suitable and only the front glass or touch layer is damaged. Eligibility is confirmed after a technician inspection — if the display itself is damaged we recommend full display replacement instead.",
    time: "Same day", devices: "iPhone · iPad · Apple Watch",
    img: "/images/craft/before-after-screen.webp",
    points: ["Eligibility checked first", "Original display retained where suitable", "6-month hardware warranty"],
  },
  {
    id: "backglass", title: "Back Glass Replacement", icon: "backglass",
    desc: "Laser-aligned factory-grade back glass. MagSafe-compatible, seamless finish.",
    time: "~60 min", devices: "iPhone 8 → 16 series",
    featured: true, img: "/images/v5/back-glass.jpg",
    points: ["MagSafe compatible", "Camera lens protected", "6-month warranty"],
  },
  {
    id: "battery", title: "Battery Replacement", icon: "battery",
    desc: "High-capacity cells with a free health check before and after.",
    time: "~30 min", devices: "iPhone · iPad · Watch · MacBook",
    img: "/images/v5/charging-port-flex.jpg",
    points: ["85%+ health on hand-back", "Free health report", "6-month warranty"],
  },
  {
    id: "camera", title: "Camera Repair", icon: "camera",
    desc: "Rear & front modules, OIS, zoom and lens replacement.",
    time: "~60 min", devices: "iPhone · iPad",
    img: "/images/v5/triple-camera.jpg",
    points: ["OEM modules", "OIS calibration", "6-month warranty"],
  },
  {
    id: "charging", title: "Charging Port / Flex", icon: "charging",
    desc: "Lightning / USB-C port, charging flex and fast-charge restoration.",
    time: "~40 min", devices: "iPhone · iPad · MacBook",
    img: "/images/v3/tech-workbench.jpg",
    points: ["Fast charge restored", "Data transfer tested", "6-month warranty"],
  },
  {
    id: "water", title: "Water Damage Revival", icon: "water",
    desc: "Ultrasonic cleaning + corrosion treatment at chip level.",
    time: "Same day", devices: "iPhone · iPad · Watch",
    img: "/images/v4/water-damage-iphone.jpg",
    points: ["Ultrasonic bath", "Corrosion treatment", "6-month warranty"],
  },
  {
    id: "logicboard", title: "Motherboard / IC Repair", icon: "board",
    desc: "Micro-soldering, board-level diagnosis, NAND, PMIC & baseband.",
    time: "1–2 days", devices: "iPhone · iPad · MacBook",
    img: "/images/v5/motherboard-macro.jpg",
    points: ["Microscope precision", "Chip-level fix", "Quoted separately — board work excluded from standard cover"],
  },
  {
    id: "speaker", title: "Speaker / Mic / Haptics", icon: "speaker",
    desc: "Earpiece, loudspeaker, microphones and Taptic Engine.",
    time: "~40 min", devices: "iPhone · iPad",
    img: "/images/v5/service-iphone.jpg",
    points: ["Full audio system", "OEM parts", "6-month warranty"],
  },
  {
    id: "os", title: "System Diagnostics & Signed Firmware Restore", icon: "settings",
    desc: "Signed iOS/iPadOS/macOS restore workflows, boot-loop diagnosis, DFU recovery and setup troubleshooting.",
    time: "30–120 min", devices: "All Apple devices",
    img: "/images/v5/macbook-pro-latest.jpg",
    points: ["Apple-Signed Restore", "Zero-Passcode Workflow", "6-Month Warranty"],
  },
  {
    id: "data", title: "Board-Level Storage IC Repair", icon: "data",
    desc: "Board-level diagnosis and storage IC repair when photos, chats or files are inaccessible because of hardware faults. No data outcome is promised before assessment.",
    time: "1–3 days", devices: "iPhone · iPad · Mac",
    img: "/images/v5/data-recovery-bench.jpg",
    points: ["Board-Level Diagnosis", "Confidential Handling", "6-Month Warranty"],
  },
];

// ---------- Repair journey ----------
export const PROCESS_STEPS = [
  { step: "01", title: "Walk In or WhatsApp", desc: "Tell us your device & issue. Free inspection & honest diagnosis.", icon: "chat", img: "/images/v3/store-interior.jpg" },
  { step: "02", title: "Free Diagnosis", desc: "We open, test and show you exactly what's wrong — with photos.", icon: "search", img: "/images/v5/motherboard-macro.jpg" },
  { step: "03", title: "Transparent Quote", desc: "Fixed price confirmed before any work. No hidden charges, ever.", icon: "price", img: "/images/v5/quote-desk.jpg" },
  { step: "04", title: "Expert Repair", desc: "Certified technicians work with OEM-grade parts, Precision TBK Lab Equipment & signed restore workflows.", icon: "wrench", img: "/images/v3/tech-workbench.jpg" },
  { step: "05", title: "Quality Check", desc: "Every repair passes a 32-point test — display, battery, sensors, audio.", icon: "check", img: "/images/v4/quality-testing.jpg" },
  { step: "06", title: "6-Month Warranty", desc: "Collect your device with a written invoice. Claim any covered issue for six months.", icon: "shield", img: "/images/v5/store-warranty.jpg" },
] as const;

// ---------- Repair status pipeline ----------
export const REPAIR_STATUS_FLOW = [
  { key: "received", label: "Received", icon: "box", desc: "Device handed over & logged in" },
  { key: "inspection", label: "Inspection", icon: "search", desc: "Diagnosis & fault isolation" },
  { key: "repair", label: "Repair in Progress", icon: "wrench", desc: "Parts fitted & board-level work" },
  { key: "quality", label: "Quality Check", icon: "check", desc: "21-point test & calibration" },
  { key: "ready", label: "Ready for Pickup", icon: "box", desc: "Tested, cleaned & packaged" },
  { key: "completed", label: "Completed", icon: "verified", desc: "Handed back with warranty" },
] as const;

// ---------- Trust signals ----------
export const STATS = [
  { value: "4.9", label: "Google Rating", sub: "1,103 verified Google reviews", icon: "star" },
  { value: "9+ yrs", label: "Apple Specialists", sub: "Halasuru, Bengaluru", icon: "experience" },
  { value: "30 min", label: "Avg. repair time", sub: "Most repairs", icon: "clock" },
  { value: "6 months", label: "Repair Warranty", sub: "Claim with your invoice", icon: "shield" },
] as const;

// ---------- Why Choose Us vs Local Market ----------
export const WHY_VS_LOCAL = [
  { feature: "Price", us: "Usually below authorised service centre rates", apple: "Apple India official pricing" },
  { feature: "Turnaround", us: "30 min avg for screen/battery — while you wait", apple: "3–7 days, device must be left at store" },
  { feature: "Walk-In Service", us: "No appointment needed, walk in anytime", apple: "Appointment required, slot availability limited" },
  { feature: "OEM-Grade Parts", us: "True Tone panels, MagSafe back glass, genuine battery cells", apple: "Apple-sourced parts only" },
  { feature: "Board-Level Repair", us: "Micro-soldering under microscope, chip-level diagnosis", apple: "Full unit replacement, no component repair" },
  { feature: "Warranty", us: "6-month repair warranty on every repair, display & battery — claim with your invoice (motherboard work excepted)", apple: "Apple's standard service warranty" },
  { feature: "Free Diagnosis", us: "Open inspection with photos, no charge", apple: "Paid diagnostic at Apple Store" },
  { feature: "Doorstep Pickup", us: "Free 24/7 pickup & drop across Bengaluru", apple: "Not available — you visit the store" },
  { feature: "Data Handling", us: "Sealed Zero-Passcode Bench Workflow (Passcode Never Requested)", apple: "Standard service policies vary" },
  { feature: "Google Rating", us: "4.9 stars from 1,103 Google reviews", apple: "Varies by Apple Store location" },
];

// ---------- Pricing: Apple India Official vs Red Apple (35% cheaper) ----------
export const PRICING_GROUPS = [
  {
    category: "iPhone Display Replacement",
    icon: "display",
    items: [
      { model: "iPhone 16 Pro Max", apple: "₹37,900", ours: "₹24,635" },
      { model: "iPhone 16 Pro", apple: "₹32,900", ours: "₹21,385" },
      { model: "iPhone 15 Pro Max", apple: "₹30,900", ours: "₹20,085" },
      { model: "iPhone 15 Pro", apple: "₹27,900", ours: "₹18,135" },
      { model: "iPhone 14 / 14 Plus", apple: "₹22,900", ours: "₹14,885" },
      { model: "iPhone 13 / 13 mini", apple: "₹19,900", ours: "₹12,935" },
      { model: "iPhone 12 / SE", apple: "₹17,900", ours: "₹11,635" },
      { model: "iPhone 11 / XR", apple: "₹15,900", ours: "₹10,335" },
    ],
  },
  {
    category: "iPhone Battery Replacement",
    icon: "battery",
    items: [
      { model: "iPhone 15 / 16 Series", apple: "₹8,900", ours: "₹5,785" },
      { model: "iPhone 14 Series", apple: "₹7,900", ours: "₹5,135" },
      { model: "iPhone 13 / 12 Series", apple: "₹6,900", ours: "₹4,485" },
      { model: "iPhone 11 / XR / X", apple: "₹6,900", ours: "₹4,485" },
    ],
  },
  {
    category: "iPhone Back Glass",
    icon: "backglass",
    items: [
      { model: "iPhone 15 / 16 Pro Max", apple: "₹24,900", ours: "₹16,185" },
      { model: "iPhone 15 / 16 Pro", apple: "₹21,900", ours: "₹14,235" },
      { model: "iPhone 14 Series", apple: "₹16,900", ours: "₹10,985" },
      { model: "iPhone 13 / 12 / 11", apple: "₹11,900", ours: "₹7,735" },
    ],
  },
  {
    category: "iPad Repair",
    icon: "ipad",
    items: [
      { model: "iPad Pro 12.9\" (M4)", apple: "₹29,900", ours: "₹19,435" },
      { model: "iPad Pro 11\" (M2)", apple: "₹24,900", ours: "₹16,185" },
      { model: "iPad Air / iPad 10", apple: "₹17,900", ours: "₹11,635" },
      { model: "iPad mini 6", apple: "₹14,900", ours: "₹9,685" },
    ],
  },
  {
    category: "MacBook Repair",
    icon: "macbook",
    items: [
      { model: "MacBook Pro 16\" Display", apple: "₹49,000", ours: "₹31,850" },
      { model: "MacBook Pro 14\" Display", apple: "₹39,000", ours: "₹25,350" },
      { model: "MacBook Air 13\" Battery", apple: "₹14,900", ours: "₹9,685" },
      { model: "MacBook Keyboard", apple: "₹19,900", ours: "₹12,935" },
    ],
  },
  {
    category: "AirPods Repair",
    icon: "airpods",
    items: [
      { model: "AirPods Pro 2 Battery", apple: "₹9,900", ours: "₹6,435" },
      { model: "AirPods Pro 1 Battery", apple: "₹7,900", ours: "₹5,135" },
      { model: "AirPods 3 Battery", apple: "₹5,900", ours: "₹3,835" },
      { model: "AirPods Case Repair", apple: "₹7,900", ours: "₹5,135" },
    ],
  },
];

// ---------- FAQ ----------
export const FAQS: { q: string; a: string }[] = [
  { q: "Which Apple Devices Do You Repair?", a: "iPhone (all models), iPad, iPod touch, AirPods, Apple Watch, MacBook Pro/Air, Mac mini, iMac and Mac Studio — plus Apple accessories." },
  { q: "How Long Does a Typical Repair Take?", a: "Most common repairs — screen, battery, charging port — take 30–60 minutes. Board-level and water damage repairs may take 1–2 days." },
  { q: "Do You Give a Warranty?", a: "Yes. Every repair, display, battery and glass service carries a 6-month repair service warranty. Motherboard repairs are the only exception. Your repair invoice is your warranty record — keep it safe and bring it back if an issue appears." },
  { q: "How Do I Claim Under Warranty?", a: "Bring the device and your repair invoice to the store, or WhatsApp the invoice number with a photo or video of the issue. We assess it, confirm whether the fault is covered and repair it under the written policy. Diagnosis and the covered repair are handled through the same invoice — no new quote for an in-warranty fault." },
  { q: "What Does the Warranty Not Cover?", a: "It does not cover physical or accidental damage after hand-back, liquid damage after hand-back, a later repair or opening by another shop, normal wear and tear, cosmetic marks, software issues unrelated to the repair, or damage caused by misuse. Motherboard repairs are excluded from the standard cover. The full policy is on our Refund & Warranty page." },
  { q: "Are Parts Genuine?", a: "We use genuine-grade, OEM-quality parts and explain your options before any work so you can choose what fits your budget." },
  { q: "Do I Need an Appointment?", a: "Walk-ins are welcome all day. For faster service, WhatsApp us your device model and issue." },
  { q: "Can You Diagnose Inaccessible Photos or Files?", a: "Yes — we inspect the storage hardware first and can quote board-level storage IC repair when a hardware fault is found. A data outcome is never promised before diagnosis, and we never wipe data without your permission." },
  { q: "Do You Offer Pickup and Delivery?", a: "Yes — doorstep pickup runs 24/7 across Bengaluru, any hour and any day. Free for repairs above ₹2,999. You get live CRM-driven WhatsApp updates at every repair stage until final handover." },
  { q: "Where Are You Located?", a: "Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. to Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008 — our Google My Business & Maps Verified Address, one minute from Halasuru Metro, open 10 AM – 12 AM midnight daily." },
  { q: "Will My Data Stay Safe?", a: "Absolutely. We keep your data private, never access your accounts, and return your device with locks intact." },
  { q: "What If You Can't Fix It?", a: "If we can't repair your device, there is no charge for the failed attempt." },
  { q: "How Do I Track My Repair Status?", a: "You get automatic WhatsApp updates from our repair CRM at every stage — received, diagnosis, quote approval, repair, quality check and ready for handover — whether you walked in or used free doorstep pickup. You never need to call us for a status update." },
  { q: "Do You Repair MacBooks Too?", a: "Yes — MacBook Pro, MacBook Air, Mac mini, iMac and Mac Studio. Display, battery, keyboard, logic board, thermal and storage upgrades." },
  { q: "What Is Front Glass Restoration?", a: "It replaces only the damaged outer glass while keeping your original OLED display, touch layer and True Tone. We bond the new glass with a TBK OCA laminating press, cure it in a 90-litre high-pressure bubble-remover chamber, and use the TBK-958 cold UV laser for precise, low-heat separation. It carries our 6-month repair warranty." },
  { q: "How Much Does Front Glass Restoration Cost?", a: "Published glass-restoration prices range from ₹2,500 for an iPhone 8 / SE (Gen 2/3) to ₹19,500 for an iPhone 18 Pro Max. Final eligibility is confirmed on inspection — if the OLED itself is damaged, we recommend a full display replacement instead." },
];

// ---------- SEO service pages ----------
export const SERVICE_PAGES: {
  slug: string; title: string; short: string; desc: string; icon: string; keywords: string[];
}[] = [
  { slug: "iphone-repair", title: "iPhone Repair — All Models", icon: "phone", short: "Screen, battery, camera & more", desc: "Complete iPhone repair for every generation.", keywords: ["iPhone repair Bangalore", "iPhone repair Halasuru"] },
  { slug: "iphone-display-repair", title: "iPhone Display / Screen Replacement", icon: "display", short: "OEM-grade OLED, True Tone preserved", desc: "Front display replacement on all iPhone models.", keywords: ["iPhone screen replacement", "iPhone display repair Bangalore"] },
  { slug: "front-glass-restoration", title: "Front Glass Restoration", icon: "display", short: "Glass-only restoration, eligibility checked first", desc: "Front glass/touch layer restoration for devices where the original display/OLED assembly remains suitable. Final eligibility is determined after technician inspection, and the service carries a 6-month hardware warranty.", keywords: ["front glass restoration Bangalore", "front glass replacement Halasuru", "glass only screen repair"] },
  { slug: "iphone-back-glass-repair", title: "iPhone Back Glass Replacement", icon: "backglass", short: "Laser-aligned, MagSafe compatible", desc: "Factory-grade back glass replacement.", keywords: ["iPhone back glass repair", "iPhone back glass replacement Bangalore"] },
  { slug: "ipad-repair", title: "iPad Repair — All Models", icon: "ipad", short: "Screens, batteries & board-level", desc: "iPad, iPad Pro, iPad Air and iPad mini repairs.", keywords: ["iPad repair Bangalore", "iPad screen replacement"] },
  { slug: "apple-watch-repair", title: "Apple Watch Repair", icon: "watch", short: "Screens, batteries & sensors", desc: "Apple Watch screen, battery, sensor repairs.", keywords: ["Apple Watch repair Bangalore"] },
  { slug: "airpods-repair", title: "AirPods Repair", icon: "airpods", short: "Battery, case, audio issues", desc: "AirPods and AirPods Pro battery replacement.", keywords: ["AirPods repair Bangalore"] },
  { slug: "macbook-repair", title: "MacBook & Mac Repair", icon: "macbook", short: "Displays, batteries & logic boards", desc: "MacBook Pro, Air, Mac mini and iMac repairs.", keywords: ["MacBook repair Bangalore"] },
  { slug: "software-recovery", title: "Apple Software & Firmware", icon: "settings", short: "iOS, macOS, restore & firmware", desc: "Apple-signed OS installation and restore.", keywords: ["iPhone software fix", "iOS restore Bangalore"] },
  { slug: "data-recovery", title: "Board-Level Storage IC Repair", icon: "data", short: "Photos, contacts, chats & files", desc: "Board-level diagnosis and storage IC repair for inaccessible data. The outcome is confirmed only after assessment and is never promised in advance.", keywords: ["board-level storage IC repair Bangalore", "iPhone storage IC repair"] },
] as const;
