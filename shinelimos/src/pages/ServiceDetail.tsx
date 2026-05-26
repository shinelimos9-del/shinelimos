import { useParams, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { SERVICES, FLEET } from "../data";
import { PageHero, SectionHeading, GoldButton, GoldDivider, GlassCard } from "../components/ui";
import BookingWidget from "../components/BookingWidget";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import TiltCard from "../components/TiltCard";
import { Check, ArrowRight, Star } from "lucide-react";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);

  useEffect(() => {
    if (!service) return;
    document.title = service.seoTitle;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", service.seoDesc);
  }, [service]);

  if (!service) return <Navigate to="/services" replace />;

  return (
    <div className="route-fade">
      <PageHero image={service.hero} eyebrow="Service" title={service.title} subtitle={service.short} />

      {/* Intro */}
      <SectionBackground image="https://images.pexels.com/photos/30096223/pexels-photo-30096223.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="Overview" title={<>About <em className="text-white not-italic">{service.title}</em></>} />
              <p className="mt-6 text-white/70 leading-relaxed text-lg">{service.intro}</p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10">
                <h3 className="font-serif-lux text-2xl text-white mb-5">Included with every reservation</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.highlights.map((h, i) => (
                    <Reveal key={h} delay={i * 60}>
                      <div className="flex items-start gap-2.5 text-white/75 text-sm">
                        <Check className="h-4 w-4 text-white mt-0.5 shrink-0" /> {h}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-32 self-start">
            <Reveal variant="right">
              <TiltCard intensity={8} className="rounded-2xl">
                <div className="glass-gold rounded-2xl p-6 mb-6">
                  <div className="text-[10px] tracking-[0.3em] text-white uppercase">Available 24/7</div>
                  <div className="font-serif-lux text-3xl text-white mt-1">Book in 60 seconds</div>
                  <p className="text-sm text-white/70 mt-2">Instant quote with no obligation.</p>
                  <div className="mt-4">
                    <GoldButton to={`/booking?type=${service.slug.includes("airport") ? "airport" : "one-way"}`}>
                      Reserve Now <ArrowRight className="h-4 w-4" />
                    </GoldButton>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
            <Reveal variant="right" delay={150}>
              <div className="glass rounded-2xl p-6 text-sm text-white/70 space-y-3">
                <div className="flex items-center gap-1 text-white">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  <span className="ml-2 text-xs text-white/70 tracking-wider">5.0 · 1,200+ reviews</span>
                </div>
                <p className="italic">"Faultless punctuality, total discretion. They've become our default."</p>
                <div className="text-[11px] tracking-widest text-white/45 uppercase">— Senate Office</div>
              </div>
            </Reveal>
          </aside>
        </div>
      </SectionBackground>

      {/* Custom Airport Limo Details Section */}
      {service.slug === "airport-limo-service" && (
        <>
          <GoldDivider />
          <SectionBackground image="https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <SectionHeading
                  eyebrow="Airport Coverage & Fleet"
                  title={<>Premium Airport Chauffeur <em className="text-white not-italic">Directory</em></>}
                  subtitle="Serving all major DMV cities, regional airports, and providing executive class SUV transits."
                />
              </Reveal>

              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Cities Card */}
                <Reveal delay={60}>
                  <div className="glass rounded-2xl p-6 border border-white/10 h-full hover:border-white/20 transition-all">
                    <h3 className="font-serif-lux text-xl text-white mb-4 border-b border-white/10 pb-2">Service Areas</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] tracking-widest text-gold uppercase mb-2">Primary Cities</div>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
                          {["Washington", "Arlington", "Alexandria", "Tysons", "Fairfax"].map((city) => (
                            <li key={city} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                              {city}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-widest text-white/40 uppercase mb-2">Secondary Cities</div>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-white/60">
                          {["Reston", "Herndon", "Bethesda", "Rockville", "Silver Spring"].map((city) => (
                            <li key={city} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/25 shrink-0" />
                              {city}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Airports Card */}
                <Reveal delay={120}>
                  <div className="glass rounded-2xl p-6 border border-white/10 h-full hover:border-white/20 transition-all">
                    <h3 className="font-serif-lux text-xl text-white mb-4 border-b border-white/10 pb-2">Airports We Serve</h3>
                    <ul className="space-y-3.5 text-sm text-white/70">
                      {[
                        "Dulles International Airport (IAD)",
                        "Ronald Reagan Washington National Airport (DCA)"
                      ].map((airport) => (
                        <li key={airport} className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-white/50 mt-1.5 shrink-0" />
                          <span>{airport}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 p-4 glass-gold rounded-xl border border-white/5 text-[11px] text-white/80 leading-relaxed">
                      <strong>Note:</strong> Real-time flight tracking & gate synchronization included with all Dulles and Ronald Reagan airport transfers.
                    </div>
                  </div>
                </Reveal>

                {/* Limo Services Card */}
                <Reveal delay={180}>
                  <div className="glass rounded-2xl p-6 border border-white/10 h-full hover:border-white/20 transition-all">
                    <h3 className="font-serif-lux text-xl text-white mb-4 border-b border-white/10 pb-2">Our Services</h3>
                    <ul className="grid grid-cols-1 gap-2.5 text-sm text-white/70">
                      {[
                        "Airport transportation",
                        "Wedding limo service",
                        "Corporate travel",
                        "Prom limo",
                        "Hourly chauffeur service",
                        "Party transportation"
                      ].map((srv) => (
                        <li key={srv} className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                          <span>{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Fleet & Car Options */}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Main Vehicle Focus Card */}
                <Reveal delay={240}>
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all bg-linear-to-r from-white/2 to-transparent">
                    <div className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Main Car Class We Provide</div>
                    <h3 className="font-serif-lux text-2xl text-white mb-4">Luxury SUV Service</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">
                      Our signature transit option focuses on high-end SUVs, providing superior legroom, road presence, and passenger comfort for all transfers.
                    </p>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-3 bg-white shrink-0" />
                        <span>Luxury SUV limo service</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-3 bg-white shrink-0" />
                        <span>Black SUV car service</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-3 bg-white shrink-0" />
                        <span>Executive SUV chauffeur</span>
                      </li>
                    </ul>
                  </div>
                </Reveal>

                {/* Car Names Card */}
                <Reveal delay={300}>
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">Vehicle Specifications</div>
                    <h3 className="font-serif-lux text-2xl text-white mb-4">Premium Fleet Selection</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">
                      We offer a curated selection of the finest executive sedans and heavy-duty luxury SUVs.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-white/80 font-serif-lux font-light">
                      {[
                        "Mercedes-Benz S-Class",
                        "Cadillac Escalade",
                        "Chevrolet Suburban",
                        "Lincoln Navigator"
                      ].map((car) => (
                        <div key={car} className="glass-gold px-3 py-2 rounded-xl border border-white/5 flex items-center justify-center text-center">
                          {car}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </SectionBackground>
        </>
      )}

      <GoldDivider />

      {/* Benefits */}
      <SectionBackground image="https://images.pexels.com/photos/9411658/pexels-photo-9411658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading eyebrow="Why Choose Us" title={<>The ShineLimos <span className="text-white">advantage</span></>} />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {service.benefits.map((b, i) => (
              <Reveal key={b.title} variant="3d" delay={i * 120}>
                <TiltCard className="rounded-2xl h-full">
                  <GlassCard className="h-full">
                    <h3 className="font-serif-lux text-xl text-white">{b.title}</h3>
                    <p className="text-sm text-white/65 mt-2 leading-relaxed">{b.body}</p>
                  </GlassCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* Recommended Fleet */}
      <SectionBackground image="https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading eyebrow="Recommended Vehicles" title={<>The fleet for <em className="text-white not-italic">{service.title}</em></>} />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FLEET.filter((v) => service.vehicles.includes(v.slug)).map((v, i) => (
              <Reveal key={v.slug} variant="3d" delay={i * 100}>
                <Link to={`/fleet#${v.slug}`}>
                  <TiltCard className="rounded-2xl">
                    <div className="group glass rounded-2xl overflow-hidden hover-lift glow-on-hover">
                      <div className="aspect-16/10 overflow-hidden">
                        <img src={v.image} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="p-5">
                        <div className="text-[10px] tracking-[0.3em] text-white uppercase">{v.category}</div>
                        <h3 className="font-serif-lux text-xl text-white mt-1">{v.name}</h3>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* Booking widget */}
      <SectionBackground image="https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionHeading eyebrow="Start Your Reservation" title={<>Get your <span className="text-white">instant quote</span></>} />
          </Reveal>
          <Reveal variant="3d" delay={150} className="mt-10">
            <BookingWidget />
          </Reveal>
        </div>
      </SectionBackground>
    </div>
  );
}
