// Global animated black & white glassmorphism background.

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-black">
      {/* Global Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" 
        style={{ backgroundImage: "url('/images/pexels-photo-17893166.webp')" }}
      />
      {/* Deep radial gradient base — pure black with subtle white glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 50%), radial-gradient(ellipse at 80% 100%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%), #000",
        }}
      />

      {/* Floating white orbs */}
      <div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-[120px] opacity-[0.08] float"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[560px] w-[560px] rounded-full blur-[140px] opacity-[0.06] float"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-[420px] w-[420px] rounded-full blur-[120px] opacity-[0.05] float"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Moving headlight streaks */}
      <div className="headlight" style={{ top: "22%", animationDelay: "0s" }} />
      <div className="headlight" style={{ top: "62%", animationDelay: "4s" }} />
      <div className="headlight" style={{ top: "85%", animationDelay: "7s" }} />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise" />
    </div>
  );
}
