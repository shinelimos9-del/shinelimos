import { useParams, Navigate, Link } from "react-router-dom";
import { LOCATIONS, SERVICES } from "../data";
import { PageHero, SectionHeading, GoldButton, GoldDivider, GlassCard } from "../components/ui";
import BookingWidget from "../components/BookingWidget";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import TiltCard from "../components/TiltCard";
import { Check, ArrowRight, MapPin } from "lucide-react";
import SEO from "../components/SEO";

export default function LocationDetail() {
  const { slug } = useParams();
  const loc = LOCATIONS.find((l) => l.slug === slug);



  if (!loc) return <Navigate to="/locations" replace />;

  return (
    <div className="route-fade">
      <SEO pageKey={loc.slug} />
      <PageHero
        image={loc.hero}
        eyebrow="Location"
        title={<>{loc.city}, <em className="text-white not-italic">{loc.region}</em></>}
        subtitle={`Premier black car, limousine and chauffeur service in ${loc.city}.`}
      />

      <SectionBackground image="/images/pexels-photo-1545732.webp" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="Local Coverage" title={<>Serving {loc.city} <em className="text-white not-italic">around the clock</em></>} />
              <p className="mt-6 text-white/70 leading-relaxed text-lg">{loc.intro}</p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10">
                <h3 className="font-serif-lux text-2xl text-white mb-5">What we offer in {loc.city}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {loc.highlights.map((h, i) => (
                    <Reveal key={h} delay={i * 60}>
                      <div className="flex items-start gap-2.5 text-white/75 text-sm">
                        <Check className="h-4 w-4 text-white mt-0.5 shrink-0" /> {h}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10">
                <h3 className="font-serif-lux text-2xl text-white mb-4">Landmarks we serve</h3>
                <div className="flex flex-wrap gap-2">
                  {loc.landmarks.map((lm, i) => (
                    <Reveal key={lm} delay={i * 50}>
                      <span className="glass px-4 py-1.5 rounded-full text-xs text-white/75 tracking-wider flex items-center gap-1.5 hover:bg-white hover:text-black transition-all cursor-default">
                        <MapPin className="h-3 w-3" /> {lm}
                      </span>
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
                  <div className="text-[10px] tracking-[0.3em] text-white uppercase">{loc.city} Dispatch</div>
                  <div className="font-serif-lux text-3xl text-white mt-1">24/7 Service</div>
                  <p className="text-sm text-white/70 mt-2">Average pickup time: 12–18 minutes anywhere in {loc.city}.</p>
                  <div className="mt-4">
                    <GoldButton to="/booking">
                      Book Pickup <ArrowRight className="h-4 w-4" />
                    </GoldButton>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </aside>
        </div>
      </SectionBackground>

      <GoldDivider />

      <SectionBackground image="/images/pexels-photo-5288741.webp" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading eyebrow="Services in this area" title={<>Every service, <span className="text-white">available in {loc.city}</span></>} />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} variant="3d" delay={i * 80}>
                <Link to={`/services/${s.slug}`} className="group">
                  <TiltCard className="rounded-2xl">
                    <GlassCard>
                      <h3 className="font-serif-lux text-lg text-white">{s.title}</h3>
                      <p className="text-xs text-white/55 mt-1.5">{s.short}</p>
                    </GlassCard>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      <SectionBackground image="/images/pexels-photo-14011664.webp" overlay="dark" parallax className="py-20 px-6">
        <Reveal variant="3d">
          <div className="mx-auto max-w-4xl">
            <BookingWidget />
          </div>
        </Reveal>
      </SectionBackground>
    </div>
  );
}
