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
                <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden glass group bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-white/10 flex items-center justify-center p-1.5">
                  {/* Top-Left Location Header */}
                  <div className="absolute top-0 inset-x-0 p-3 z-10 bg-linear-to-b from-black/85 via-black/40 to-transparent pointer-events-none">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MapPin className="h-3.5 w-3.5 text-[#c9a96e] shrink-0" />
                      <div className="font-bold text-sm text-white uppercase tracking-wider leading-tight drop-shadow-md">
                        {l.city}
                      </div>
                    </div>
                    <div className="text-[10px] tracking-[0.25em] text-[#c9a96e] uppercase font-medium ml-5 drop-shadow-sm">{l.region}</div>
                  </div>

                  <img
                    src={l.hero}
                    alt={l.city}
                    loading="lazy"
                    className="w-full h-full object-contain scale-120 translate-y-2 group-hover:scale-130 opacity-95 group-hover:opacity-100 transition-all duration-500 drop-shadow-xl"
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
