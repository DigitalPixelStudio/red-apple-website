export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-4">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <p className="text-2xl font-poppins text-white mb-4">🍎 Red Apple</p>
          <p className="text-gray-500 text-sm">Certified Apple repair specialists in Bengaluru since 2014.</p>
        </div>
        <div>
          <h4 className="text-white text-sm font-medium mb-4">Services</h4>
          {["iPhone Repair", "iPad Repair", "Mac mini Repair", "Apple Watch Repair", "AirPods Repair"].map((s) => <p key={s} className="text-gray-500 text-sm">{s}</p>)}
        </div>
        <div>
          <h4 className="text-white text-sm font-medium mb-4">Contact</h4>
          {["+91 8660 663 776", "Indiranagar, Bengaluru", "10 AM – 8 PM (Mon-Sat)"].map((c) => <p key={c} className="text-gray-500 text-sm">{c}</p>)}
        </div>
        <div>
          <h4 className="text-white text-sm font-medium mb-4">Follow</h4>
          <div className="flex gap-4 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition">Instagram</a>
            <a href="#" className="hover:text-white transition">YouTube</a>
            <a href="#" className="hover:text-white transition">Google</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
        © 2026 Red Apple Mobile Repair. All rights reserved.
      </div>
    </footer>
  );
}
