import { LineIcon } from "@/components/Icons";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ff9500]"><LineIcon name="apple" size={22} color="#fff" /></span>
        <span className="text-[14px] font-semibold text-[#86868b]">Loading Red Apple…</span>
      </div>
    </div>
  );
}
