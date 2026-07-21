import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageHero, GoldButton, GoldDivider } from "../components/ui";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import Parallax from "../components/Parallax";
import SectionBackground from "../components/SectionBackground";
import { getVehicles, ADMIN_BASE_URL } from "../utils/api";
import { Users, Briefcase, ArrowRight, Check, Loader2 } from "lucide-react";
import SEO from "../components/SEO";

export default function Fleet() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const response = await getVehicles();
      if (response.success) {
        setVehicles(response.vehicles);
      } else {
        setError(response.message || "Failed to fetch fleet");
      }
    } catch (error) {
      console.error("Error fetching fleet:", error);
      setError("An unexpected error occurred while fetching the fleet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-white/50 bg-black">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading our fleet...</p>
      </div>
    );
  }

  return (
    <div className="route-fade">
      <SEO pageKey="fleet" />
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        video="https://videos.pexels.com/video-files/13643097/13643097-uhd_3840_2160_24fps.mp4"
        eyebrow="The Fleet"
        title={<>Our <em className="text-white not-italic">Premium Fleet</em></>}
        subtitle="Explore our premium fleet of luxury vehicles, meticulously maintained for your ultimate comfort and safety."
      />

      {error ? (
        <section className="py-20 px-6 text-center bg-black">
          <div className="max-w-md mx-auto glass-dark rounded-3xl p-10 border border-white/10">
            <p className="text-red-400 mb-6">{error}</p>
            <GoldButton onClick={fetchFleet}>Try Again</GoldButton>
          </div>
        </section>
      ) : (
        <SectionBackground image="/images/pexels-photo-9411658.webp" overlay="dark" parallax className="py-20 px-6">
          <div className="mx-auto max-w-7xl space-y-24">
            {vehicles.map((v, i) => (
              <div
                key={v._id}
                id={v.vehicle_name.toLowerCase().replace(/\s+/g, '-')}
                className={`grid lg:grid-cols-2 gap-10 items-center scroll-mt-32 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
              >
                <Reveal variant={i % 2 === 0 ? "left" : "right"} className="[direction:ltr]">
                  <Parallax speed={0.15}>
                    <Link to={`/fleet/${v.vehicle_name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <TiltCard className="rounded-3xl">
                        <div className="relative group rounded-3xl overflow-hidden glass aspect-16/11 cursor-pointer flex items-center justify-center p-3 bg-black/40">
                          <img
                            src={v.image.startsWith('http') ? v.image : `${ADMIN_BASE_URL}${v.image}`}
                            alt={v.vehicle_name}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                          {/* View Details overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                            <div className="glass border border-white/30 text-white text-xs tracking-[0.3em] uppercase px-6 py-3 rounded-full flex items-center gap-2">
                              View Details <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </TiltCard>
                    </Link>
                    <div className="absolute -bottom-5 -left-5 glass-gold rounded-2xl px-5 py-3 hidden md:block float">
                      <div className="text-[10px] tracking-[0.3em] text-white uppercase">Class</div>
                      <div className="font-serif-lux text-lg text-white">{v.vehicle_class_name || "Luxury Class"}</div>
                    </div>
                  </Parallax>
                </Reveal>

                <Reveal variant={i % 2 === 0 ? "right" : "left"} delay={120} className="[direction:ltr]">
                  <div className="text-[10px] tracking-[0.4em] text-white uppercase mb-3">{v.vehicle_class_name || "Premium Service"}</div>
                  <h2 className="font-serif-lux text-4xl md:text-5xl text-white leading-tight">{v.vehicle_name}</h2>
                  <p className="mt-4 text-white/65 leading-relaxed">{v.discription || "Experience the pinnacle of professional transportation with our premium luxury vehicles, luxury SUV hire, and executive sedan service."}</p>

                  <div className="mt-6 flex gap-6">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Users className="h-4 w-4 text-white" /> Up to {v.passenger_capacity} passengers
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Briefcase className="h-4 w-4 text-white" /> {v.luggage_capacity} bags
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2.5">
                    {(v.features || []).slice(0, 6).map((f: string, j: number) => (
                      <Reveal key={f} delay={j * 60}>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Check className="h-3.5 w-3.5 text-white" /> {f}
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <GoldButton to={`/fleet/${v.vehicle_name.toLowerCase().replace(/\s+/g, '-')}`}>
                      View Details <ArrowRight className="h-4 w-4" />
                    </GoldButton>
                    <GoldButton to={`/booking?vehicle=${v._id}`} variant="outline">
                      Reserve Now <ArrowRight className="h-4 w-4" />
                    </GoldButton>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </SectionBackground>
      )}

      <GoldDivider />

      <SectionBackground image="/images/pexels-photo-17893166.webp" overlay="dark" parallax className="py-16 px-6 text-center">
        <Reveal>
          <p className="text-white/55 max-w-2xl mx-auto">
            Looking for something exotic? Custom Rolls-Royce, Bentley and Lamborghini bookings
            available with 48-hour notice. <Link to="/contact" className="text-white hover:underline">Contact our concierge →</Link>
          </p>
        </Reveal>
      </SectionBackground>
    </div>
  );
}