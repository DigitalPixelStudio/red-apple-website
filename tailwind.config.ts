import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "float": "float 20s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translate(0, 0)" }, "33%": { transform: "translate(30px, -30px)" }, "66%": { transform: "translate(-20px, 20px)" } },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "slide-up": { from: { opacity: 0, transform: "translateY(100px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 0 20px rgba(255,255,255,0.1)" }, "50%": { boxShadow: "0 0 40px rgba(255,255,255,0.2)" } },
      },
    },
  },
  plugins: [],
};
export default config;
