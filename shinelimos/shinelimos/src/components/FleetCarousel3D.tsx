// 3D rotating fleet showcase — uses CSS preserve-3d to position cards on a rotating cylinder
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { ADMIN_BASE_URL } from "../utils/api";

interface FleetCarousel3DProps {
  vehicles?: any[];
}

export default function FleetCarousel3D({ vehicles = [] }: FleetCarousel3DProps) {
  const [active, setActive] = useState(0);
  const N = vehicles.length;
  const angle = 360 / Math.max(N, 1);
  const ref = useRef<HTMLDivElement>(null);

  // auto-rotate
  useEffect(() => {
    if (N <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % N), 4500);
    return () => clearInterval(t);
  }, [N]);

  if (N === 0) return null;

  const item = vehicles[active];

  return (
    <div className="relative">
      {/* 3D Stage */}
      <div className="perspective-2000 h-[320px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <div
          ref={ref}
          className="relative w-[280px] h-[175px] md:w-[400px] md:h-[250px] preserve-3d transition-transform duration-1200"
          style={{
            transform: `translateZ(-450px) rotateY(${-active * angle}deg)`,
            transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {vehicles.map((v, i) => {
            const isActive = i === active;
            return (
              <div
                key={v._id || i}
                className="absolute inset-0 rounded-2xl overflow-hidden glass"
                style={{
                  transform: `rotateY(${i * angle}deg) translateZ(450px)`,
                  backfaceVisibility: "hidden",
                  boxShadow: isActive
                    ? "0 20px 50px rgba(255,255,255,0.12)"
                    : "0 10px 30px rgba(0,0,0,0.5)",
                  filter: isActive ? "none" : "brightness(0.4)",
                  transition: "filter 0.8s, box-shadow 0.8s",
                }}
              >
                <img
                  src={v.image.startsWith('http') ? v.image : `${ADMIN_BASE_URL}${v.image}`}
                  alt={v.vehicle_name}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <div className="text-[10px] tracking-[0.3em] text-white/80 uppercase">{v.vehicle_class_name || "Luxury Class"}</div>
                  <div className="font-serif-lux text-xl text-white leading-tight">{v.vehicle_name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active card info */}
      <div className="mt-6 max-w-2xl mx-auto text-center" key={active}>
        <div className="fade-up">
          <h3 className="font-serif-lux text-3xl md:text-4xl text-white">{item.vehicle_name}</h3>
          <p className="text-white/65 mt-2 line-clamp-2">{item.discription || "Experience the pinnacle of luxury transit."}</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {item.passenger_capacity} pax</span>
            <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {item.luggage_capacity} bags</span>
          </div>
          <div className="mt-6">
            <Link
              to={`/booking?vehicle=${item._id}`}
              className="inline-block bg-white text-black text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-full hover:scale-105 transition-transform"
            >
              Reserve {item.vehicle_class_name || "Vehicle"}
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      {N > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setActive((a) => (a - 1 + N) % N)}
            aria-label="Previous vehicle"
            className="w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {vehicles.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Vehicle ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? "bg-white w-4" : "bg-white/20"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((a) => (a + 1) % N)}
            aria-label="Next vehicle"
            className="w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
