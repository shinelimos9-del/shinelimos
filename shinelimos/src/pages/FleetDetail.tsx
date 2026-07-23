import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, Link } from "react-router-dom";
import { Users, Briefcase, Check, ArrowRight, ArrowLeft, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FLEET } from "../data";
import { GoldButton, GoldDivider } from "../components/ui";
import Reveal from "../components/Reveal";
import SEO from "../components/SEO";
import { getVehicles, ADMIN_BASE_URL } from "../utils/api";

export default function FleetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherVehicles, setOtherVehicles] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState<number | null>(null);

  useEffect(() => {
    if (activeImg !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeImg]);

  useEffect(() => {
    if (activeImg === null || !vehicle?.images?.length) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveImg((prev) => (prev === null ? 0 : (prev - 1 + vehicle.images.length) % vehicle.images.length));
      } else if (e.key === "ArrowRight") {
        setActiveImg((prev) => (prev === null ? 0 : (prev + 1) % vehicle.images.length));
      } else if (e.key === "Escape") {
        setActiveImg(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImg, vehicle?.images?.length]);

  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        
        const response = await getVehicles();
        let dbVehicle = null;
        let matchedOther = [];

        if (response.success && response.vehicles) {
          dbVehicle = response.vehicles.find((v: any) => {
            const formattedDbName = v.vehicle_name.toLowerCase().replace(/\s+/g, "-");
            return formattedDbName === slug || v._id === slug;
          });
          
          matchedOther = response.vehicles.filter((v: any) => {
            const formattedDbName = v.vehicle_name.toLowerCase().replace(/\s+/g, "-");
            return formattedDbName !== slug && v._id !== slug;
          }).slice(0, 3).map((v: any) => ({
            slug: v.vehicle_name.toLowerCase().replace(/\s+/g, "-"),
            name: v.vehicle_name,
            category: v.vehicle_class_name,
            blurb: v.discription,
            image: v.image.startsWith('http') ? v.image : `${ADMIN_BASE_URL}${v.image}`,
            passengers: parseInt(v.passenger_capacity) || 3,
            luggage: parseInt(v.luggage_capacity) || 3,
          }));
        }

        const defaultAmenities = [
          { label: "Phone Chargers", icon: "🔌" },
          { label: "Refreshments", icon: "🥤" },
          { label: "Fiji Water", icon: "💧" },
          { label: "Free WiFi", icon: "📶" }
        ];

        if (dbVehicle) {
          const staticMatch = FLEET.find(v => 
            v.slug === slug || 
            v.name.toLowerCase() === dbVehicle.vehicle_name.toLowerCase()
          );

          const mapped = {
            slug: dbVehicle.vehicle_name.toLowerCase().replace(/\s+/g, "-"),
            name: dbVehicle.vehicle_name,
            category: dbVehicle.vehicle_class_name,
            passengers: parseInt(dbVehicle.passenger_capacity) || 3,
            luggage: parseInt(dbVehicle.luggage_capacity) || 3,
            features: dbVehicle.features || [],
            image: dbVehicle.image.startsWith('http') ? dbVehicle.image : `${ADMIN_BASE_URL}${dbVehicle.image}`,
            images: (dbVehicle.images && dbVehicle.images.length > 0)
              ? dbVehicle.images.map((img: string) => img.startsWith('http') ? img : `${ADMIN_BASE_URL}${img}`)
              : [dbVehicle.image.startsWith('http') ? dbVehicle.image : `${ADMIN_BASE_URL}${dbVehicle.image}`],
            blurb: dbVehicle.discription,
            description: dbVehicle.discription,
            amenities: staticMatch ? staticMatch.amenities : defaultAmenities,
            price: dbVehicle.price,
            _id: dbVehicle._id
          };
          setVehicle(mapped);
        } else {
          const staticMatch = FLEET.find(
            (v) =>
              v.slug === slug ||
              v.name.toLowerCase().replace(/\s+/g, "-") === slug ||
              v.category.toLowerCase().replace(/\s+/g, "-") === slug
          );
          if (staticMatch) {
            setVehicle({
              ...staticMatch,
              images: staticMatch.images || [staticMatch.image]
            });
            matchedOther = FLEET.filter(v => v.slug !== staticMatch.slug).slice(0, 3);
          } else {
            setVehicle(null);
          }
        }
        setOtherVehicles(matchedOther);
      } catch (err) {
        console.error("Error loading vehicle details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/50">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
        <div className="text-6xl">🚗</div>
        <h1 className="text-3xl font-serif-lux">Vehicle Not Found</h1>
        <GoldButton to="/fleet">
          <ArrowLeft className="h-4 w-4" /> Back to Fleet
        </GoldButton>
      </div>
    );
  }

  return (
    <div className="route-fade bg-black min-h-screen text-white">
      <SEO pageKey="fleet" />

      {/* ── HERO BREADCRUMB BAR ── */}
      <div
        className="relative pt-32 pb-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.98) 100%), url(${vehicle.images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="relative mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/fleet" className="hover:text-white transition-colors">Our Fleet</Link>
            <span>/</span>
            <span className="text-white/80">{vehicle.name}</span>
          </div>
          <div className="text-[11px] tracking-[0.5em] text-white/50 uppercase mb-3">
            ✦ {vehicle.category} ✦
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {vehicle.name}
          </h1>
          <p className="mt-4 text-white/60 max-w-xl text-sm leading-relaxed">
            {vehicle.blurb}
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12 space-y-12">
        
        {/* ─── TOP: BENTO GRID IMAGE GALLERY (FULL WIDTH) ─── */}
        <div className="space-y-4">
          <div className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-2">
            ✦ Vehicle Gallery (Click to Zoom) ✦
          </div>
          
          {/* Dynamic Bento Grid based on Image Count */}
          {(() => {
            const count = vehicle.images.length;
            if (count === 1) {
              return (
                <div 
                  onClick={() => setActiveImg(0)}
                  className="rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d] aspect-[16/9] max-w-4xl mx-auto"
                >
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.name}`}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>
              );
            }
            if (count === 2) {
              return (
                <div className="grid grid-cols-2 gap-4 h-64 sm:h-80 md:h-[450px]">
                  {vehicle.images.map((img: string, index: number) => (
                    <div 
                      key={index}
                      onClick={() => setActiveImg(index)}
                      className="rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                    >
                      <img
                        src={img}
                        alt={`${vehicle.name} - ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              );
            }
            if (count === 3) {
              return (
                <div className="grid grid-cols-12 gap-4 h-64 sm:h-80 md:h-[450px]">
                  <div 
                    onClick={() => setActiveImg(0)}
                    className="col-span-8 rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                  >
                    <img
                      src={vehicle.images[0]}
                      className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                    />
                  </div>
                  <div className="col-span-4 grid grid-rows-2 gap-4">
                    {vehicle.images.slice(1, 3).map((img: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => setActiveImg(index + 1)}
                        className="rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (count === 4) {
              return (
                <div className="grid grid-cols-12 gap-4 h-64 sm:h-80 md:h-[480px]">
                  <div 
                    onClick={() => setActiveImg(0)}
                    className="col-span-6 rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                  >
                    <img
                      src={vehicle.images[0]}
                      className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                    />
                  </div>
                  <div className="col-span-6 grid grid-cols-2 gap-4">
                    {vehicle.images.slice(1, 4).map((img: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => setActiveImg(index + 1)}
                        className={`rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d] ${index === 2 ? 'col-span-2' : ''}`}
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            // 5 or more images
            return (
              <div className="grid grid-cols-12 gap-4">
                {/* Image 1: Left */}
                <div 
                  onClick={() => setActiveImg(0)}
                  className="col-span-12 sm:col-span-4 h-64 sm:h-72 md:h-80 lg:h-[360px] rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                >
                  <img
                    src={vehicle.images[0]}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>

                {/* Image 2: Center */}
                <div 
                  onClick={() => setActiveImg(1)}
                  className="col-span-12 sm:col-span-4 h-64 sm:h-72 md:h-80 lg:h-[360px] rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                >
                  <img
                    src={vehicle.images[1]}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>

                {/* Image 3: Top Right */}
                <div 
                  onClick={() => setActiveImg(2)}
                  className="col-span-12 sm:col-span-4 h-64 sm:h-72 md:h-80 lg:h-[360px] rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                >
                  <img
                    src={vehicle.images[2]}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>

                {/* Image 4: Bottom Left */}
                <div 
                  onClick={() => setActiveImg(3)}
                  className="col-span-12 sm:col-span-6 h-64 sm:h-72 md:h-80 lg:h-[360px] rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                >
                  <img
                    src={vehicle.images[3]}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>

                {/* Image 5: Bottom Right */}
                <div 
                  onClick={() => setActiveImg(4)}
                  className="col-span-12 sm:col-span-6 h-64 sm:h-72 md:h-80 lg:h-[360px] rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 group relative bg-[#0d0d0d]"
                >
                  <img
                    src={vehicle.images[4]}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* ─── BOTTOM: VEHICLE DETAILS (STACKED BELOW GALLERY) ─── */}
        <div className="grid lg:grid-cols-12 gap-8 pt-6 border-t border-white/5">
          {/* Left Details: About & Specs (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-serif-lux text-white">Book Your {vehicle.category}</h2>
              <h3 className="text-lg font-light text-white/90">{vehicle.name}</h3>
              <p className="text-white/65 leading-relaxed text-sm pt-2">{vehicle.description}</p>
            </div>

            {/* Passengers & Luggage */}
            <div className="flex gap-6 max-w-md">
              <div className="flex items-center gap-3 glass rounded-2xl px-5 py-4 flex-1">
                <Users className="h-5 w-5 text-white/70 shrink-0" />
                <div>
                  <div className="text-[10px] text-white/40 tracking-widest uppercase">Passengers</div>
                  <div className="text-white font-semibold text-lg">{vehicle.passengers}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 glass rounded-2xl px-5 py-4 flex-1">
                <Briefcase className="h-5 w-5 text-white/70 shrink-0" />
                <div>
                  <div className="text-[10px] text-white/40 tracking-widest uppercase">Luggage</div>
                  <div className="text-white font-semibold text-lg">{vehicle.luggage}</div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-4">
                ✦ Included Amenities ✦
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vehicle.amenities.map((a: any) => (
                  <div
                    key={a.label}
                    className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-xs text-white/80">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-4">
                ✦ Vehicle Features ✦
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vehicle.features.map((f: string) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Box: Booking Call-to-Actions (4 Cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-6">
              <div className="text-center">
                <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase">Premium Service</span>
                <div className="text-xl font-serif-lux text-white mt-1">Ready to Ride?</div>
              </div>
              
              <div className="space-y-3">
                <GoldButton to={`/booking?vehicle=${vehicle.slug}`} className="w-full justify-center">
                  Quote & Book <ArrowRight className="h-4 w-4" />
                </GoldButton>
                <GoldButton to="/fleet" variant="outline" className="w-full justify-center">
                  <ArrowLeft className="h-4 w-4" /> View All Fleet
                </GoldButton>
              </div>

              <div className="text-[11px] text-white/40 text-center leading-relaxed">
                24/7 Professional Chauffeur Service. Real-time Flight tracking & all-inclusive pricing.
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoldDivider />

      {/* ── OTHER FLEET CARS ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="text-center mb-10">
              <div className="text-[10px] tracking-[0.5em] text-white/40 uppercase mb-3">
                ✦ Explore More ✦
              </div>
              <h2 className="font-serif-lux text-3xl md:text-4xl text-white">
                More From Our Fleet
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherVehicles.map((v, i) => (
              <Reveal key={v.slug} delay={i * 100}>
                <Link
                  to={`/fleet/${v.slug}`}
                  className="group block glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50"
                >
                  {/* Car Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 text-[9px] tracking-[0.3em] text-white/60 uppercase bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      {v.category}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-serif-lux text-lg text-white mb-1">{v.name}</h3>
                    <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">{v.blurb}</p>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {v.passengers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> {v.luggage}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>      {/* Full Screen Image Modal via Portal */}
      {activeImg !== null && vehicle?.images?.[activeImg] && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out backdrop-blur-md"
          onClick={() => setActiveImg(null)}
        >
          {/* Back Button */}
          {vehicle.images.length > 1 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm hover:scale-105 border border-white/10 hover:border-white/20 select-none z-10"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImg((prev) => (prev === null ? 0 : (prev - 1 + vehicle.images.length) % vehicle.images.length));
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={vehicle.images[activeImg]}
            alt={vehicle.name}
            className="max-w-full max-h-[92vh] object-contain rounded-2xl shadow-2xl transition-all duration-300 cursor-default select-none animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {vehicle.images.length > 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm hover:scale-105 border border-white/10 hover:border-white/20 select-none z-10"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImg((prev) => (prev === null ? 0 : (prev + 1) % vehicle.images.length));
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm hover:scale-105 border border-white/10 hover:border-white/20 select-none z-10"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImg(null);
            }}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>,
        document.body
      )}
      <style>{`
        @keyframes fadeInImg {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}