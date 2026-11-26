import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ticket = url.searchParams.get("ticket") || "";
  const phone = url.searchParams.get("phone") || "";
  if (ticket.trim().length < 5 || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "Enter your receipt number and registered phone number." }, { status: 400 });
  }
  const endpoint = process.env.CRM_REPAIR_STATUS_ENDPOINT || "https://red-apple-crm.vercel.app/api/repair-status";
  try {
    const response = await fetch(endpoint + "?ticket=" + encodeURIComponent(ticket) + "&phone=" + encodeURIComponent(phone), {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    const data = await response.json().catch(() => ({ ok: false, error: "Status service unavailable." }));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Repair status is temporarily unavailable. Please contact the store." }, { status: 503 });
  }
}
