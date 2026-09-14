"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send } from "lucide-react";

const responses: Record<string, string> = {
  screen: "Your screen issue could be a cracked display, LCD damage, or digitizer problem. We offer free diagnostics!",
  battery: "Battery issues likely need replacement. We use premium-grade batteries with 12-month warranty. Starting at ₹799!",
  charging: "Charging issues are often caused by a damaged port or motherboard problem. We diagnose the exact cause.",
  water: "Water damage requires immediate attention — do not charge your device! Bring it in within 24 hours.",
  camera: "Camera issues could be lens damage, sensor malfunction, or software glitch. We offer front and rear camera replacement.",
  "face id": "Face ID problems are often related to the TrueDepth camera or software. We can repair or recalibrate.",
  default: "I can help with common Apple device issues! Try asking about: screen, battery, charging, camera, water damage, Face ID...",
};

export default function RepairAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setTimeout(() => setMessages([{ role: "assistant", text: "Hi! 👋 I'm Red Apple's repair assistant. Tell me what's wrong with your device — screen, battery, charging, camera, water damage, Face ID..." }]), 500); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    const lower = input.toLowerCase();
    let reply = responses.default;
    for (const [key, val] of Object.entries(responses)) {
      if (key !== "default" && lower.includes(key)) { reply = val; break; }
    }
    setInput("");
    setTimeout(() => setMessages(prev => [...prev, { role: "assistant", text: reply }]), 600);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-24 right-6 z-40">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bg-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Bot size={28} className="text-white" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 glass rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div><p className="text-white text-sm font-medium">Red Apple Repair Assistant</p><p className="text-gray-500 text-xs">Usually replies in minutes</p></div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.role === "user" ? "bg-white text-black" : "bg-white/10 text-gray-300"}`}>{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Describe your issue..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
              <button onClick={sendMessage} className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-purple-500 transition"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
