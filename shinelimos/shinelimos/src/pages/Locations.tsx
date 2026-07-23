import { Link } from "react-router-dom";
import { PageHero } from "../components/ui";
import TiltCard from "../components/TiltCard";
import SectionBackground from "../components/SectionBackground";
import { LOCATIONS } from "../data";
import { MapPin } from "lucide-react";
import SEO from "../components/SEO";

const BG = "/images/pexels-photo-9488191.webp";

export default function Locations() {
  return (
    <div className="route-fade">
      <SEO pageKey="locations" />
      <PageHero
        image="/video/carvideo-ezgif.com-video-to-avif-converter.avif"
        eyebrow="Service Area"
        title={<>Regional <em className="text-white not-italic">Transportation</em></>}
        subtitle="Extensive coverage area for all your regional transportation needs. We provide Washington metro transportation, intercity chauffeur service, and luxury rides across the capital."
      />

      <SectionBackground image={BG} overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          {LOCATIONS.map((l) => (
            <Link key={l.slug} to={`/locations/${l.slug}`}>
              <TiltCard intensity={15} className="rounded-2xl">
                <div className="relative h-28 sm:h-36 md:h-40 rounded-2xl overflow-hidden glass group bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-white/10 flex items-center justify-center p-1">
                  {/* Top-Left Location Header */}
                  <div className="absolute top-0 inset-x-0 p-2 sm:p-3 z-10 bg-linear-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#c9a96e] shrink-0" />
                      <div className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider leading-tight drop-shadow-md">
                        {l.city}
                      </div>
                    </div>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase font-medium ml-4 sm:ml-5 drop-shadow-sm">{l.region}</div>
                  </div>

                  <img
                    src={l.hero}
                    alt={l.city}
                    loading="lazy"
                    className={`w-full h-full ${
                      l.hero.endsWith('.jpeg') || l.hero.endsWith('.jpg') 
                        ? "object-cover scale-100 group-hover:scale-105" 
                        : "object-contain scale-110 sm:scale-115 group-hover:scale-120"
                    } opacity-95 group-hover:opacity-100 transition-all duration-500 drop-shadow-xl`}
                  />
                </div>
              </TiltCard>
            </Link>
          ))}
        </div>
      </SectionBackground>
    </div>
  );
}
