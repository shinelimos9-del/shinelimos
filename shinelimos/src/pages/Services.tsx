import { Link } from "react-router-dom";
import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import SectionBackground from "../components/SectionBackground";
import { SERVICES } from "../data";
import { ArrowRight } from "lucide-react";

const BG = "https://images.pexels.com/photos/29580163/pexels-photo-29580163.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400";

export default function Services() {
  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/34440729/pexels-photo-34440729.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        video="https://videos.pexels.com/video-files/8344921/8344921-uhd_3840_2160_25fps.mp4"
        eyebrow="Services"
        title={<>Crafted for <em className="text-white not-italic">Every Occasion</em></>}
        subtitle="Seven signature services. One uncompromising standard."
      />

      <SectionBackground image={BG} overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} variant="3d" delay={i * 90}>
              <Link to={`/services/${s.slug}`}>
                <TiltCard className="rounded-2xl h-full">
                  <div className="group glass rounded-2xl overflow-hidden hover-lift h-full glow-on-hover">
                    <div className="relative aspect-16/10 overflow-hidden">
                      <img
                        src={s.hero}
                        alt={s.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif-lux text-2xl text-white">
                        {s.title}
                      </h3>
                      <p className="text-sm text-white/55 mt-2">{s.short}</p>
                      <div className="mt-5 flex items-center gap-2 text-xs text-white tracking-widest uppercase">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </SectionBackground>
    </div>
  );
}
