import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageHero, GoldButton, GoldDivider } from "../components/ui";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import Parallax from "../components/Parallax";
import SectionBackground from "../components/SectionBackground";
import { getVehicles, ADMIN_BASE_URL } from "../utils/api";
import { FLEET, COMPANY } from "../data";
import { Users, Briefcase, ArrowRight, Check, Loader2, Phone, Sparkles } from "lucide-react";
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
      if (response.success && Array.isArray(response.vehicles)) {
        setVehicles(response.vehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching fleet:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Find specialty vehicles (Party Buses, Stretch Limos, 50-pax Coaches) from static data that are not in DB
  const specialtyVehicles = FLEET.filter((fv) => {
    const isSpecialty = fv.slug.includes("bus") || fv.slug.includes("coach") || fv.slug.includes("stretch");
    const existsInDb = vehicles.some((dbV) => 
      dbV.vehicle_name.toLowerCase().includes(fv.name.toLowerCase()) || 
      fv.name.toLowerCase().includes(dbV.vehicle_name.toLowerCase())
    );
    return isSpecialty && !existsInDb;
  });

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
      <SEO 
        pageKey="fleet"
        title="Our Fleet | Luxury Sedans, SUVs, S-Class & Sprinters — Shine Limos"
        description="Explore our premium fleet of luxury sedans, Cadillac Escalades, Mercedes-Benz S-Class, Sprinters, and executive party buses in Washington DC."
      />
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        video="https://videos.pexels.com/video-files/13643097/13643097-uhd_3840_2160_24fps.mp4"
        eyebrow="The Fleet"
        title={<>Our <em className="text-white not-italic">Premium Fleet</em></>}
        subtitle="Explore our premium fleet of luxury sedans, executive SUVs, Mercedes Sprinters, and celebration party buses — meticulously maintained for your comfort and safety."
      />

      {error && vehicles.length === 0 ? (
        <section className="py-20 px-6 text-center bg-black">
          <div className="max-w-md mx-auto glass-dark rounded-3xl p-10 border border-white/10">
            <p className="text-red-400 mb-6">{error}</p>
            <GoldButton onClick={fetchFleet}>Try Again</GoldButton>
          </div>
        </section>
      ) : (
        <SectionBackground image="/images/pexels-photo-9411658.webp" overlay="dark" parallax className="py-20 px-6">
          <div className="mx-auto max-w-7xl space-y-24">
            {/* Standard Fleet (Sedans, SUVs, Sprinters) */}
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
                            src={v.image?.startsWith('http') ? v.image : `${ADMIN_BASE_URL}${v.image}`}
                            alt={v.vehicle_name}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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

            {/* Specialty Vehicles (Party Buses, 50-Pax Coaches) */}
            {specialtyVehicles.length > 0 && (
              <div className="pt-10 border-t border-white/10 space-y-24">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Specialty & Large Group Charters</div>
                  <h3 className="font-serif-lux text-3xl md:text-4xl text-white">Party Buses & Executive Coaches</h3>
                  <p className="text-white/60 text-sm mt-2 max-w-xl mx-auto">Available for corporate roadshows, wedding parties, and private events with customized chauffeur itineraries.</p>
                </div>

                {specialtyVehicles.map((sv, idx) => (
                  <div
                    key={sv.slug}
                    id={sv.slug}
                    className={`grid lg:grid-cols-2 gap-10 items-center scroll-mt-32 ${idx % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
                  >
                    <Reveal variant={idx % 2 === 0 ? "left" : "right"} className="[direction:ltr]">
                      <Parallax speed={0.15}>
                        <Link to={`/fleet/${sv.slug}`}>
                          <TiltCard className="rounded-3xl">
                            <div className="relative group rounded-3xl overflow-hidden glass aspect-16/11 cursor-pointer flex items-center justify-center p-3 bg-black/40">
                              <img
                                src={sv.image}
                                alt={sv.name}
                                loading="lazy"
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              <div className="absolute top-4 right-4 bg-gold text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                Call to Book
                              </div>
                            </div>
                          </TiltCard>
                        </Link>
                      </Parallax>
                    </Reveal>

                    <Reveal variant={idx % 2 === 0 ? "right" : "left"} delay={120} className="[direction:ltr]">
                      <div className="inline-block text-[10px] tracking-[0.3em] text-gold uppercase px-3 py-1 bg-gold/10 rounded-full mb-3 border border-gold/30">
                        {sv.category} • Call to Book
                      </div>
                      <h2 className="font-serif-lux text-4xl md:text-5xl text-white leading-tight">{sv.name}</h2>
                      <p className="mt-4 text-white/65 leading-relaxed">{sv.description}</p>

                      <div className="mt-6 flex gap-6">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Users className="h-4 w-4 text-white" /> Up to {sv.passengers} passengers
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Briefcase className="h-4 w-4 text-white" /> {sv.luggage} bags
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-2.5">
                        {sv.features.slice(0, 6).map((f: string, j: number) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                            <Check className="h-3.5 w-3.5 text-white" /> {f}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <a 
                          href={`tel:${COMPANY.phoneRaw}`}
                          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
                        >
                          <Phone className="h-4 w-4" /> Call to Book ({COMPANY.phone})
                        </a>
                        <GoldButton to={`/fleet/${sv.slug}`} variant="outline">
                          View Details <ArrowRight className="h-4 w-4" />
                        </GoldButton>
                      </div>
                    </Reveal>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionBackground>
      )}

      <GoldDivider />

      {/* Exotic Fleet Call-Out Banner */}
      <SectionBackground image="/images/pexels-photo-17893166.webp" overlay="dark" parallax className="py-20 px-6">
        <Reveal variant="3d">
          <div className="max-w-4xl mx-auto glass-dark rounded-3xl p-8 md:p-12 border border-gold/30 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Bespoke Exotic Service
            </div>
            <h3 className="font-serif-lux text-3xl md:text-5xl text-white mb-4">
              Ultra-Luxury & Exotic Motorcars
            </h3>
            <p className="text-white/75 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Custom bookings for <strong className="text-white">Rolls-Royce Ghost & Phantom, Bentley Flying Spur, and Lamborghini Urus</strong> are available with 48-hour advance notice.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`tel:${COMPANY.phoneRaw}`}
                className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <Phone className="w-4 h-4" /> Call Concierge {COMPANY.phone}
              </a>
              <GoldButton to="/contact" variant="outline">
                Inquire Online <ArrowRight className="w-4 h-4 ml-2" />
              </GoldButton>
            </div>
          </div>
        </Reveal>
      </SectionBackground>
    </div>
  );
}