import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <div className="text-[80px]">🍎</div>
          <h1 className="font-apple mt-4 text-[40px] font-extrabold tracking-tight text-[#1d1d1f]">Page not found</h1>
          <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-[#86868b]">This page seems to have left the Apple store. Let&rsquo;s get you back to repairs.</p>
          <Link href="/" className="cta-primary mt-8">← Back to Home</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
