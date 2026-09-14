"use client";
import { motion } from "framer-motion";
import { Star, MapPin, Quote } from "lucide-react";

const reviews = [
  { name: "Priya S.", rating: 5, text: "iPhone 13 screen replaced in 25 minutes. Flawless finish. Highly recommended!", location: "Indiranagar, Bengaluru", date: "2 weeks ago" },
  { name: "Arjun K.", rating: 5, text: "Back glass repair on my AirPods Pro 2. They look brand new. Great service!", location: "HAL 2nd Stage, Bengaluru", date: "1 month ago" },
  { name: "Meera R.", rating: 5, text: "Mac mini logic board repair. Saved my data too. Professional and honest.", location: "BTM Layout, Bengaluru", date: "3 weeks ago" },
  { name: "Rahul P.", rating: 5, text: "Apple Watch Series 9 screen replacement. Quick turnaround, very reasonable price.", location: "HSR Layout, Bengaluru", date: "1 week ago" },
  { name: "Ananya T.", rating: 5, text: "iPad Pro battery replacement. Original-grade battery, now lasts all day. Perfect!", location: "JP Nagar, Bengaluru", date: "2 months ago" },
  { name: "Vikram J.", rating: 5, text: "Face ID repair on iPhone 14 Pro. They matched my original. Best in Bengaluru!", location: "Whitefield, Bengaluru", date: "1 month ago" },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Reviews</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">700+ <span className="text-purple-400">Five-Star</span> Reviews</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />)}
            <span className="text-yellow-400 text-sm ml-2">4.9/5.0</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm mb-4 italic">{r.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{r.name}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin size={10} /> {r.location}</p>
                </div>
                <span className="text-xs text-gray-600">{r.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-10">
          <a href="https://share.google/Dj3VbuZuzR8mYbRgS" target="_blank" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm">
            <MapPin size={18} /> View all Google Reviews →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
