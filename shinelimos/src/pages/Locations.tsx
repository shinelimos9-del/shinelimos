import { Link } from "react-router-dom";
import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import SectionBackground from "../components/SectionBackground";
import { LOCATIONS } from "../data";
import { MapPin, ArrowRight } from "lucide-react";

const BG = "https://images.pexels.com/photos/9488191/pexels-photo-9488191.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400";

export default function Locations() {
  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/11732276/pexels-photo-11732276.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        video="https://videos.pexels.com/video-files/34654261/14688509_3840_2160_30fps.mp4"
        eyebrow="Service Area"
        title={<>Throughout the <em className="text-white not-italic">DMV</em></>}
        subtitle="From Embassy Row to Tysons Galleria, from Old Town to Reston — our chauffeurs know every street, shortcut and valet entrance."
      />

      <SectionBackground image={BG} overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((l, i) => (
            <Reveal key={l.slug} variant="3d" delay={i * 100}>
              <Link to={`/locations/${l.slug}`}>
                <TiltCard className="rounded-2xl h-full">
                  <div className="group glass rounded-2xl overflow-hidden hover-lift h-full glow-on-hover">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={l.hero} alt={l.city} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ken-burns" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white text-xs tracking-widest">
                        <MapPin className="h-3.5 w-3.5" /> {l.region}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif-lux text-2xl text-white">{l.city}</h3>
                      <p className="text-sm text-white/55 mt-2 line-clamp-2">{l.intro}</p>
                      <div className="mt-5 flex items-center gap-2 text-xs text-white tracking-widest">
                        EXPLORE <ArrowRight className="h-3 w-3" />
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
