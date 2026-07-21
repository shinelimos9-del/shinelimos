import { Phone } from "lucide-react";
import { COMPANY } from "../data";

export default function CallNowButton() {
  return (
    <a
      href={`tel:${COMPANY.phoneRaw}`}
      aria-label="Call Now"
      className="fixed bottom-24 right-6 z-45 flex items-center justify-center gap-2.5 bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-full px-5 py-3 text-white hover:text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer"
      style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Pulsing dot indicator */}
        <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-white/20 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </div>
      <Phone className="h-4 w-4 text-white" />
      <span className="text-[10px] tracking-[0.2em] uppercase font-light font-syncopate">
        Call Now
      </span>
    </a>
  );
}
