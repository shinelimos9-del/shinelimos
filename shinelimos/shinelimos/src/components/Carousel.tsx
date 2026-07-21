// Auto-sliding image carousel with manual controls + 3D coverflow effect
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselItem = {
  image: string;
  title?: string;
  subtitle?: string;
};

export default function Carousel({
  items,
  autoplay = 5000,
  showInfo = true,
}: {
  items: CarouselItem[];
  autoplay?: number;
  showInfo?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setIdx((i) => (i + 1) % items.length);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);

  useEffect(() => {
    if (paused || !autoplay) return;
    timer.current = setInterval(next, autoplay);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, autoplay, items.length]);

  return (
    <div
      className="relative w-full perspective-2000"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[420px] md:h-[560px] overflow-hidden rounded-3xl glass">
        {items.map((it, i) => {
          const offset = i - idx;
          const isActive = i === idx;
          const absOff = Math.abs(offset);
          const visible = absOff <= 2;
          return (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-[1100ms]"
              style={{
                transform: `translateX(${offset * 70}%) translateZ(${isActive ? 0 : -200 - absOff * 100}px) rotateY(${offset * -18}deg) scale(${isActive ? 1 : 0.85})`,
                opacity: visible ? (isActive ? 1 : 0.35) : 0,
                zIndex: items.length - absOff,
                transformStyle: "preserve-3d",
                transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-3xl">
                <img
                  src={it.image}
                  alt={it.title || ""}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`w-full h-full object-cover ${isActive ? "ken-burns" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                {showInfo && it.title && isActive && (
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 fade-up">
                    {it.subtitle && (
                      <div className="text-[11px] tracking-[0.4em] text-white/80 uppercase mb-3">
                        ✦ {it.subtitle} ✦
                      </div>
                    )}
                    <h3 className="font-serif-lux text-3xl md:text-5xl text-white max-w-2xl leading-tight">
                      {it.title}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass-dark border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass-dark border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-500 rounded-full ${
              i === idx ? "w-10 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
