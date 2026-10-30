export const SITE = {
  name: "Red Apple Mobile Repair Store",
  legalName: "RED APPLE MOBILE REPAIR STORE",
  tagline: "Apple care, perfected.",
  shortDescription:
    "Bangalore's specialist Apple repair studio in Halasuru. iPhone, iPad, AirPods, Apple Watch, MacBook & Mac repairs — displays, batteries, back glass, water damage, firmware, data recovery & more.",
  phone: "+918660663776",
  phoneHref: "tel:+918660663776",
  whatsapp: "918660663776",
  email: "redapplemobilerepairing48@gmail.com",
  address: "No. 1, Mahatma Gandhi Rd, opp. Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008",
  area: "Halasuru, Bengaluru",
  city: "Bengaluru",
  pincode: "560008",
  state: "Karnataka",
  country: "IN",
  hours: "10:30 AM – 9:00 PM (Open all 7 days)",
  hoursSchema: "Mo-Su 10:30-21:00",
  geo: { lat: 12.9748, lng: 77.6249 },
  rating: "4.9",
  ratingCount: "905",
  yearsActive: "9+",
  warrantyDays: "90",
  avgRepairTime: "30",
  mapsUrl: "https://maps.app.goo.gl/hAVKyH8oXTajihfz8",
  mapsReviewUrl: "https://maps.app.goo.gl/hAVKyH8oXTajihfz8",
  mapsEmbed:
    "https://www.google.com/maps?q=RED%20APPLE%20MOBILE%20REPAIR%20STORE%20Halasuru%20Bengaluru&z=16&output=embed",
  gmbUrl: "https://share.google/mG09cFuGwiO85aYIJ",
  justdialUrl: "https://www.justdial.com/Bengaluru/Red-Apple-Mobile-Repair-Store-Halasuru",
  youtubeUrl: "https://www.youtube.com/@RedAppleMobileRepairStore",
  facebookUrl: "https://www.facebook.com/RedAppleMobileRepairStore",
  instagramUrl: "https://www.instagram.com/RedAppleMobileRepairStore",
  telegramUrl: "https://t.me/RedAppleMobileRepairStore",
} as const;

export const baseUrl = "https://red-apple-repair.vercel.app";

export const wa = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

// ---------- Apple ecosystem device families ----------
export const DEVICE_FAMILIES = [
  { id: "iphone", name: "iPhone", icon: "phone", tag: "All models", desc: "Displays, batteries, cameras, back glass & full hardware service.", img: "/images/v4/iphone-17-pro-max.jpg" },
  { id: "ipad", name: "iPad", icon: "ipad", tag: "All models", desc: "iPad, iPad Pro, iPad Air & iPad mini — screens, battery & logic.", img: "/images/v4/repair-process.jpg" },
  { id: "watch", name: "Apple Watch", icon: "watch", tag: "All series", desc: "Screens, batteries, sensors & straps across all Watch series.", img: "/images/v4/apple-watch-ultra.jpg" },
  { id: "airpods", name: "AirPods", icon: "airpods", tag: "All generations", desc: "Battery, charging case, speaker & microphone repair.", img: "/images/v4/airpods-real.jpg" },
  { id: "macbook", name: "MacBook", icon: "macbook", tag: "Pro · Air · Mini", desc: "MacBook Pro, Air, Mac mini & iMac — display, battery, board.", img: "/images/v3/macbook-pro.jpg" },
  { id: "software", name: "Software & Recovery", icon: "wrench", tag: "iOS · macOS · firmware", desc: "OS install, firmware, boot loops, data recovery & unlocking.", img: "/images/v3/circuit-board.jpg" },
] as const;

// ---------- Devices for the quote engine ----------
export const QUOTE_DEVICES = [
  {
    id: "iphone", label: "iPhone",
    models: ["iPhone 17 Pro Max", "iPhone 17 Pro Max", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
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
  "Front Display Replacement",
  "Back Glass Replacement",
  "Battery Replacement",
  "Camera Repair",
  "Charging Port / Flex",
  "Speaker / Mic / Haptics",
  "Motherboard / IC Repair",
  "Water Damage Revival",
  "Software / iOS Issue",
  "Data Recovery",
  "Unlocking (lawful)",
  "OS / Firmware Installation",
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
    featured: true, img: "/images/v3/iphone-display.jpg",
    points: ["True Tone preserved", "OEM-grade panel", "90-day warranty"],
  },
  {
    id: "backglass", title: "Back Glass Replacement", icon: "backglass",
    desc: "Laser-aligned factory-grade back glass. MagSafe-compatible, seamless finish.",
    time: "~60 min", devices: "iPhone 8 → 16 series",
    featured: true, img: "/images/v3/iphone-backglass.jpg",
    points: ["MagSafe compatible", "Camera lens protected", "Seamless blend"],
  },
  {
    id: "battery", title: "Battery Replacement", icon: "battery",
    desc: "High-capacity cells with a free health check before and after.",
    time: "~30 min", devices: "iPhone · iPad · Watch · MacBook",
    img: "/images/v3/charging-port.jpg",
    points: ["85%+ health guaranteed", "Free health report", "6-month guarantee"],
  },
  {
    id: "camera", title: "Camera Repair", icon: "camera",
    desc: "Rear & front modules, OIS, zoom and lens replacement.",
    time: "~60 min", devices: "iPhone · iPad",
    img: "/images/v4/camera-repair.jpg",
    points: ["OEM modules", "OIS calibration", "Focus tested"],
  },
  {
    id: "charging", title: "Charging Port / Flex", icon: "charging",
    desc: "Lightning / USB-C port, charging flex and fast-charge restoration.",
    time: "~40 min", devices: "iPhone · iPad · MacBook",
    img: "/images/v3/tech-workbench.jpg",
    points: ["Fast charge restored", "Data transfer tested", "Clean port install"],
  },
  {
    id: "water", title: "Water Damage Revival", icon: "water",
    desc: "Ultrasonic cleaning + corrosion treatment at chip level.",
    time: "Same day", devices: "iPhone · iPad · Watch",
    img: "/images/v4/water-damage-iphone.jpg",
    points: ["Ultrasonic bath", "Corrosion treatment", "Highest success rate"],
  },
  {
    id: "logicboard", title: "Motherboard / IC Repair", icon: "board",
    desc: "Micro-soldering, board-level diagnosis, NAND, PMIC & baseband.",
    time: "1–2 days", devices: "iPhone · iPad · MacBook",
    img: "/images/v3/circuit-board.jpg",
    points: ["Microscope precision", "Chip-level fix", "Data preserved"],
  },
  {
    id: "speaker", title: "Speaker / Mic / Haptics", icon: "speaker",
    desc: "Earpiece, loudspeaker, microphones and Taptic Engine.",
    time: "~40 min", devices: "iPhone · iPad",
    img: "/images/v3/smartphone-repair.jpg",
    points: ["Full audio system", "OEM parts", "Tested after install"],
  },
  {
    id: "os", title: "OS · Firmware · Recovery", icon: "settings",
    desc: "iOS/iPadOS/macOS install, firmware restore, boot loops, DFU & setup issues.",
    time: "30–120 min", devices: "All Apple devices",
    img: "/images/v3/laptop-closeup.jpg",
    points: ["Genuine Apple OS", "Data-safe first", "Full testing"],
  },
  {
    id: "data", title: "Data Recovery", icon: "data",
    desc: "Recover photos, chats, files & documents from damaged or locked devices.",
    time: "1–3 days", devices: "iPhone · iPad · Mac",
    img: "/images/v4/data-recovery-tech.jpg",
    points: ["Logical + board-level", "Confidential handling", "Recover before repair"],
  },
];

// ---------- Repair journey ----------
export const PROCESS_STEPS = [
  { step: "01", title: "Walk In or WhatsApp", desc: "Tell us your device & issue. Free inspection & honest diagnosis.", icon: "chat", img: "/images/v3/phone-broken.jpg" },
  { step: "02", title: "Free Diagnosis", desc: "We open, test and show you exactly what's wrong — with photos.", icon: "search", img: "/images/v4/camera-repair.jpg" },
  { step: "03", title: "Transparent Quote", desc: "Fixed price confirmed before any work. No hidden charges, ever.", icon: "price", img: "/images/v3/team-work.jpg" },
  { step: "04", title: "Expert Repair", desc: "Certified technicians repair with genuine-grade parts & precision tools.", icon: "wrench", img: "/images/v3/tech-workbench.jpg" },
  { step: "05", title: "Quality Check", desc: "Every repair passes a 21-point test — display, battery, sensors, audio.", icon: "check", img: "/images/v4/data-recovery-tech.jpg" },
  { step: "06", title: "90-Day Warranty", desc: "Collect your device with warranty. We stand behind every fix.", icon: "shield", img: "/images/v3/store-interior.jpg" },
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
  { value: "4.9★", label: "Google Rating", sub: "905+ reviews", icon: "star" },
  { value: "9+ yrs", label: "Apple Specialists", sub: "Halasuru, Bengaluru", icon: "experience" },
  { value: "30 min", label: "Avg. repair time", sub: "Most repairs", icon: "clock" },
  { value: "90 days", label: "Warranty", sub: "On every repair", icon: "shield" },
] as const;

// ---------- Why Choose Us vs Local Market ----------
export const WHY_VS_LOCAL = [
  { feature: "Price", us: "35% cheaper than Apple Authorized Service Centre", apple: "Full Apple India official pricing" },
  { feature: "Turnaround", us: "30 min avg for screen/battery — while you wait", apple: "3–7 days, device must be left at store" },
  { feature: "Walk-In Service", us: "No appointment needed, walk in anytime", apple: "Appointment required, slot availability limited" },
  { feature: "OEM-Grade Parts", us: "True Tone panels, MagSafe back glass, genuine battery cells", apple: "Apple-sourced parts only" },
  { feature: "Board-Level Repair", us: "Micro-soldering under microscope, chip-level diagnosis", apple: "Full unit replacement, no component repair" },
  { feature: "Warranty", us: "90-day service warranty + 6-month battery health", apple: "90-day Apple service warranty" },
  { feature: "Free Diagnosis", us: "Open inspection with photos, no charge", apple: "Paid diagnostic at Apple Store" },
  { feature: "Doorstep Pickup", us: "Free pickup & drop across Bengaluru", apple: "Not available — you visit the store" },
  { feature: "Data Privacy", us: "Your data is never accessed — sealed workflow", apple: "Apple may access data during service" },
  { feature: "Google Rating", us: "4.9 stars from 905+ verified reviews", apple: "Varies by Apple Store location" },
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
  { q: "Which Apple devices do you repair?", a: "iPhone (all models), iPad, iPod touch, AirPods, Apple Watch, MacBook Pro/Air, Mac mini, iMac and Mac Studio — plus Apple accessories." },
  { q: "How long does a typical repair take?", a: "Most common repairs — screen, battery, charging port — take 30–60 minutes. Board-level and water damage repairs may take 1–2 days." },
  { q: "Do you give a warranty?", a: "Yes — every repair includes a 90-day service warranty. Battery and display work also carries a 6-month health guarantee." },
  { q: "Are parts genuine?", a: "We use genuine-grade, OEM-quality parts and explain your options before any work so you can choose what fits your budget." },
  { q: "Do I need an appointment?", a: "Walk-ins are welcome all day. For faster service, WhatsApp us your device model and issue." },
  { q: "Can you recover my data after a screen or water issue?", a: "Yes — data recovery is one of our specialities. We never wipe data without your permission." },
  { q: "Do you offer pickup and delivery?", a: "Yes, free doorstep pickup and drop is available across Bengaluru for eligible repairs." },
  { q: "Where are you located?", a: "No. 1, Mahatma Gandhi Rd, opp. Bhadra Landmark, Halasuru, Bengaluru 560008 — 1 minute from Halasuru Metro, open 10:30 AM – 9:00 PM daily." },
  { q: "Will my data stay safe?", a: "Absolutely. We keep your data private, never access your accounts, and return your device with locks intact." },
  { q: "What if you can't fix it?", a: "If we can't repair your device, there is no charge for the failed attempt." },
  { q: "How do I track my repair status?", a: "WhatsApp us your receipt number and we'll send real-time updates." },
  { q: "Do you repair MacBooks too?", a: "Yes — MacBook Pro, MacBook Air, Mac mini, iMac and Mac Studio. Display, battery, keyboard, logic board, thermal and storage upgrades." },
];

// ---------- SEO service pages ----------
export const SERVICE_PAGES: {
  slug: string; title: string; short: string; desc: string; icon: string; keywords: string[];
}[] = [
  { slug: "iphone-repair", title: "iPhone Repair — All Models", icon: "phone", short: "Screen, battery, camera & more", desc: "Complete iPhone repair for every generation.", keywords: ["iPhone repair Bangalore", "iPhone repair Halasuru"] },
  { slug: "iphone-display-repair", title: "iPhone Display / Screen Replacement", icon: "display", short: "OEM-grade OLED, True Tone preserved", desc: "Front display replacement on all iPhone models.", keywords: ["iPhone screen replacement", "iPhone display repair Bangalore"] },
  { slug: "iphone-back-glass-repair", title: "iPhone Back Glass Replacement", icon: "backglass", short: "Laser-aligned, MagSafe compatible", desc: "Factory-grade back glass replacement.", keywords: ["iPhone back glass repair", "iPhone back glass replacement Bangalore"] },
  { slug: "ipad-repair", title: "iPad Repair — All Models", icon: "ipad", short: "Screens, batteries & board-level", desc: "iPad, iPad Pro, iPad Air and iPad mini repairs.", keywords: ["iPad repair Bangalore", "iPad screen replacement"] },
  { slug: "apple-watch-repair", title: "Apple Watch Repair", icon: "watch", short: "Screens, batteries & sensors", desc: "Apple Watch screen, battery, sensor repairs.", keywords: ["Apple Watch repair Bangalore"] },
  { slug: "airpods-repair", title: "AirPods Repair", icon: "airpods", short: "Battery, case, audio issues", desc: "AirPods and AirPods Pro battery replacement.", keywords: ["AirPods repair Bangalore"] },
  { slug: "macbook-repair", title: "MacBook & Mac Repair", icon: "macbook", short: "Displays, batteries & logic boards", desc: "MacBook Pro, Air, Mac mini and iMac repairs.", keywords: ["MacBook repair Bangalore"] },
  { slug: "software-recovery", title: "Apple Software & Firmware", icon: "settings", short: "iOS, macOS, restore & firmware", desc: "Genuine Apple OS installation, restore.", keywords: ["iPhone software fix", "iOS restore Bangalore"] },
  { slug: "data-recovery", title: "Data Recovery for Apple Devices", icon: "data", short: "Photos, contacts, chats & files", desc: "Professional data recovery from damaged devices.", keywords: ["iPhone data recovery Bangalore"] },
] as const;
