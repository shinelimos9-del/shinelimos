import { Link } from "react-router-dom";
import { PageHero, GoldButton, GoldDivider } from "../components/ui";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import Parallax from "../components/Parallax";
import SectionBackground from "../components/SectionBackground";
import { FLEET } from "../data";
import { Users, Briefcase, ArrowRight, Check } from "lucide-react";

export default function Fleet() {
  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/15200595/pexels-photo-15200595.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        video="https://videos.pexels.com/video-files/13643097/13643097-uhd_3840_2160_24fps.mp4"
        eyebrow="The Fleet"
        title={<>An <em className="text-white not-italic">Uncompromising</em> Collection</>}
        subtitle="Every vehicle is under three model-years old, garage-kept, professionally detailed before every reservation, and operated only by background-checked chauffeurs."
      />

      <SectionBackground image="https://images.pexels.com/photos/9411658/pexels-photo-9411658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-7xl space-y-24">
          {FLEET.map((v, i) => (
            <div
              key={v.slug}
              id={v.slug}
              className={`grid lg:grid-cols-2 gap-10 items-center scroll-mt-32 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
            >
              <Reveal variant={i % 2 === 0 ? "left" : "right"} className="[direction:ltr]">
                <Parallax speed={0.15}>
                  <TiltCard className="rounded-3xl">
                    <div className="relative group rounded-3xl overflow-hidden glass aspect-16/11">
                      <img
                        src={v.image}
                        alt={v.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ken-burns"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </TiltCard>
                  <div className="absolute -bottom-5 -left-5 glass-gold rounded-2xl px-5 py-3 hidden md:block float">
                    <div className="text-[10px] tracking-[0.3em] text-white uppercase">Class</div>
                    <div className="font-serif-lux text-lg text-white">{v.category}</div>
                  </div>
                </Parallax>
              </Reveal>

              <Reveal variant={i % 2 === 0 ? "right" : "left"} delay={120} className="[direction:ltr]">
                <div className="text-[10px] tracking-[0.4em] text-white uppercase mb-3">{v.category}</div>
                <h2 className="font-serif-lux text-4xl md:text-5xl text-white leading-tight">{v.name}</h2>
                <p className="mt-4 text-white/65 leading-relaxed">{v.blurb}</p>

                <div className="mt-6 flex gap-6">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Users className="h-4 w-4 text-white" /> Up to {v.passengers} passengers
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Briefcase className="h-4 w-4 text-white" /> {v.luggage} bags
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {v.features.map((f, j) => (
                    <Reveal key={f} delay={j * 60}>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="h-3.5 w-3.5 text-white" /> {f}
                      </div>
                    </Reveal>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <GoldButton to={`/booking?vehicle=${v.slug}`}>
                    Reserve This Vehicle <ArrowRight className="h-4 w-4" />
                  </GoldButton>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </SectionBackground>

      <GoldDivider />

      <SectionBackground image="https://images.pexels.com/photos/17893166/pexels-photo-17893166.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-16 px-6 text-center">
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
