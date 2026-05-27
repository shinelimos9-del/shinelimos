import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Plane, Heart, Briefcase, Crown, Wine, Star, MapPin, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeading, GoldButton, GlassCard, GoldDivider } from "../components/ui";
import BookingWidget from "../components/BookingWidget";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import Carousel from "../components/Carousel";
import Parallax from "../components/Parallax";
import FleetCarousel3D from "../components/FleetCarousel3D";
import SectionBackground from "../components/SectionBackground";
import { getVehicles } from "../utils/api";
import { SERVICES, LOCATIONS, TESTIMONIALS, COMPANY } from "../data";

const SECONDARY_VIDEO =
  "https://videos.pexels.com/video-files/8344927/8344927-uhd_3840_2160_25fps.mp4";

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "airport-limo-service": Plane,
  "wedding-limo-service": Heart,
  "party-bus-rental": Wine,
  "black-car-service": Briefcase,
  "suv-limo-service": Crown,
  "sprinter-van-rental": Briefcase,
  "luxury-car-rental": Crown,
};

const SHOWCASE_SLIDES = [
  {
    image: "https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "Capitol Hill",
    title: "Where the Capital's most discerning travelers begin their day.",
  },
  {
    image: "https://images.pexels.com/photos/11732276/pexels-photo-11732276.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "Lincoln Memorial",
    title: "Monumental moments deserve monumental arrivals.",
  },
  {
    image: "https://images.pexels.com/photos/17893166/pexels-photo-17893166.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "After Hours",
    title: "Washington never sleeps. Neither do we.",
  },
  {
    image: "https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "The Fleet",
    title: "Hand-detailed, garage-kept, never more than three years young.",
  },
  {
    image: "https://images.pexels.com/photos/30096223/pexels-photo-30096223.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "Wedding Service",
    title: "From first look to last dance, every moment perfectly choreographed.",
  },
  {
    image: "https://images.pexels.com/photos/33598033/pexels-photo-33598033.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000",
    subtitle: "Dulles & Reagan",
    title: "Flight-tracked airport transfers, twenty-four hours a day.",
  },
];

const BG_IMAGES = {
  services:
    "https://images.pexels.com/photos/30096223/pexels-photo-30096223.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  showcase:
    "https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  fleet:
    "https://images.pexels.com/photos/9411658/pexels-photo-9411658.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  whyUs:
    "https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  locations:
    "https://images.pexels.com/photos/1545732/pexels-photo-1545732.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  testimonials:
    "https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  cta:
    "https://images.pexels.com/photos/34440729/pexels-photo-34440729.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
};

gsap.registerPlugin(useGSAP);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetchHomeVehicles();
  }, []);

  const fetchHomeVehicles = async () => {
    try {
      const response = await getVehicles();
      if (response.success) {
        setVehicles(response.vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles for home carousel:", error);
    }
  };

  useGSAP(
    () => {
      const el = heroRef.current;
      if (!el) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const fadeEls = el.querySelectorAll("[data-home-fade]");
      const videoEl = el.querySelector("[data-home-video]");
      const sidebarEl = el.querySelectorAll("[data-home-sidebar]");

      if (fadeEls.length > 0) {
        tl.fromTo(
          fadeEls,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }
        );
      }

      if (videoEl) {
        tl.fromTo(
          videoEl,
          { scale: 1.08, filter: "blur(6px)" },
          { scale: 1, filter: "blur(0px)", duration: 1.6 },
          0
        );
      }

      if (sidebarEl.length > 0) {
        tl.fromTo(
          sidebarEl,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8, stagger: 0.1 },
          0.5
        );
      }
    },
    { scope: heroRef }
  );

  return (
    <div className="route-fade bg-black text-white">
      {/* Booking Widget Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowBooking(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-white/5"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] tracking-[0.4em] text-white/70 uppercase font-orbitron font-bold">Book Your Luxury Chauffeur</span>
              <h2 className="text-2xl font-serif-lux text-white mt-1">Instant Reservation</h2>
            </div>
            <BookingWidget compact />
          </div>
        </div>
      )}

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-[#111111]">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src="/video/car video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Faint Red circles in background like the image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[25%] w-64 h-64 border border-red-500/10 rounded-full" />
            <div className="absolute bottom-[20%] left-[40%] w-48 h-48 border border-red-500/10 rounded-full" />
            <div className="absolute top-[10%] right-[35%] w-72 h-72 border border-red-500/10 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 w-full flex flex-col lg:flex-row items-center gap-12 mt-12 lg:mt-0 z-10">
          {/* Left Content */}
          <div className="flex-1 text-left relative z-10 ml-0 lg:ml-24">
            
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.2] tracking-wide" data-home-fade style={{ fontFamily: "'Orbitron', sans-serif" }}>
              CREATE YOUR <br />
              <span className="text-[#ff1100]">OWN</span> STYLE
            </h1>

            <p className="mt-8 text-white/50 text-sm max-w-sm font-light leading-relaxed tracking-wider" data-home-fade>
              Diam viverra nunc ullamcorper ac bibendum. Malesuada maecenas lacus magna turpis
            </p>


            
          </div>

        </div>
        

      </section>

      {/* MARQUEE BRANDS */}
      <section className="py-10 border-y border-white/5 overflow-hidden bg-black">
        <div className="flex marquee w-max gap-16 text-white/20 text-xl md:text-2xl tracking-[0.3em] font-serif-lux">
          {[
            "MERCEDES-BENZ S-CLASS / LUXURY SEDAN", "CADILLAC ESCALADE", "CHEVROLET SUBURBAN", "LINCOLN NAVIGATOR",
            "MERCEDES-BENZ S-CLASS / LUXURY SEDAN", "CADILLAC ESCALADE", "CHEVROLET SUBURBAN", "LINCOLN NAVIGATOR",
          ].map((b, i) => (
            <span key={i} className="whitespace-nowrap">✦ {b}</span>
          ))}
        </div>
      </section>

      {/* SERVICES with 3D tilt cards */}
      <SectionBackground image={BG_IMAGES.services} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title={<>Exceptional & <em className="text-white not-italic">Personalized</em></>}
              subtitle="We proudly bring exceptional, personalized service tailored to your unique needs."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[s.slug] || Briefcase;
              return (
                <Reveal key={s.slug} variant="3d" delay={i * 80}>
                  <Link to={`/services/${s.slug}`}>
                    <TiltCard className="rounded-2xl h-full">
                      <div className="glass rounded-2xl p-6 h-full group glow-on-hover flex flex-col justify-between">
                        <div className="flex flex-col gap-4">
                          <div className="glass-gold w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-serif-lux text-xl text-white group-hover:text-white transition-colors">{s.title}</h3>
                            <p className="mt-2 text-sm text-white/60 leading-relaxed font-light">{s.short}</p>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] text-white tracking-widest uppercase transition-colors group-hover:text-zinc-300">
                          Read more <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </SectionBackground>

      {/* IMAGE CAROUSEL — DC Showcase */}
      <SectionBackground image={BG_IMAGES.showcase} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="The Washington Experience"
              title={<>A city of <em className="text-white not-italic">moments</em>. A fleet of <em className="text-white not-italic">memories</em>.</>}
              subtitle="Swipe through the experiences that define ShineLimos."
            />
          </Reveal>
          <Reveal variant="3d" delay={150} className="mt-14">
            <Carousel items={SHOWCASE_SLIDES} autoplay={5500} />
          </Reveal>
        </div>
      </SectionBackground>

      {/* 3D FLEET CAROUSEL */}
      <SectionBackground image={BG_IMAGES.fleet} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="The Fleet"
              title={<>Hand-picked. <span className="text-white">Hand-detailed.</span></>}
              subtitle="Rotating showcase of our most reserved vehicles. Each less than three model-years old."
            />
          </Reveal>
          <Reveal variant="3d" delay={150} className="mt-14">
            <FleetCarousel3D vehicles={vehicles} />
          </Reveal>
          <div className="mt-8 text-center">
            <GoldButton to="/fleet" variant="outline">
              View Full Fleet <ArrowRight className="h-4 w-4" />
            </GoldButton>
          </div>
        </div>
      </SectionBackground>

      {/* PARALLAX VIDEO STORY SECTION */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-110"
            poster="https://images.pexels.com/photos/8425035/pexels-photo-8425035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
          >
            <source src={SECONDARY_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="text-[11px] tracking-[0.5em] text-white uppercase mb-5">
              ✦ The ShineLimos Standard ✦
            </div>
            <h2 className="font-serif-lux text-4xl md:text-6xl text-white leading-tight">
              Every door opened.<br />
              Every detail anticipated.<br />
              <em className="text-white/80">Every time.</em>
            </h2>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-8 text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
              From the suited chauffeur waiting fifteen minutes early to the chilled bottle
              of water in your cup-holder — we measure success in moments you'll remember
              and worries you'll never have.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHY US — split with parallax image */}
      <SectionBackground image={BG_IMAGES.whyUs} overlay="dark" parallax className="py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <Parallax speed={0.2}>
              <div className="relative">
                <TiltCard className="rounded-3xl">
                  <div className="relative rounded-3xl overflow-hidden aspect-4/5 glass">
                    <img
                      src="https://images.pexels.com/photos/8425035/pexels-photo-8425035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900"
                      alt="Chauffeur opening door"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover ken-burns"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 glass-dark rounded-2xl p-5">
                      <div className="text-[10px] tracking-[0.3em] text-white uppercase mb-1">Award Winning</div>
                      <div className="font-serif-lux text-2xl text-white">"Best Chauffeur Service in DC" — Washingtonian Magazine</div>
                    </div>
                  </div>
                </TiltCard>
                <div className="absolute -top-6 -right-6 hidden md:block">
                  <div className="glass-gold rounded-2xl px-6 py-5 text-center w-44 float-3d">
                    <div className="font-serif-lux text-5xl text-white">15+</div>
                    <div className="text-[10px] tracking-[0.25em] text-white/70 mt-1">YEARS OF SERVICE</div>
                  </div>
                </div>
              </div>
            </Parallax>
          </Reveal>

          <Reveal variant="right">
            <SectionHeading
              align="left"
              eyebrow="The ShineLimos Difference"
              title={<>Quiet excellence, <span className="text-white">every detail.</span></>}
            />
            <div className="mt-10 space-y-6">
              {[
                { title: "Vetted, Suited Chauffeurs", body: "Background-checked, defensive-driving certified, and trained in the protocols of diplomatic and executive travel." },
                { title: "Flight & Traffic Intelligence", body: "Our dispatch system monitors every flight and DC-area traffic incident in real time, adjusting your pickup automatically." },
                { title: "All-Inclusive Pricing", body: "Tolls, gratuity, fuel surcharges and standard wait time — all included. The quote is the price." },
                { title: "Discretion Guaranteed", body: "NDAs available on request. Manifests, routes and passenger lists handled with absolute confidentiality." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 100} variant="right">
                  <div className="flex gap-4">
                    <div className="glass-gold rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-serif-lux text-xl text-white">{f.title}</h4>
                      <p className="text-sm text-white/60 mt-1.5 leading-relaxed">{f.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </SectionBackground>

      {/* LOCATIONS with 3D tilt */}
      <SectionBackground image={BG_IMAGES.locations} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Service Area"
              title={<>The <em className="text-white not-italic">DMV</em>, perfected.</>}
              subtitle="Washington DC, Northern Virginia and Maryland — covered 24/7 by our local dispatch."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
            {LOCATIONS.map((l, i) => (
              <Reveal key={l.slug} variant="3d" delay={i * 90}>
                <Link to={`/locations/${l.slug}`}>
                  <TiltCard intensity={15} className="rounded-2xl">
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden glass group">
                      <img
                        src={l.hero}
                        alt={l.city}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-5">
                        <MapPin className="h-4 w-4 text-white mb-2" />
                        <div className="font-serif-lux text-xl text-white leading-tight">
                          {l.city}
                        </div>
                        <div className="text-[10px] tracking-[0.25em] text-white/55 mt-1 uppercase">{l.region}</div>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* TESTIMONIALS with 3D tilt */}
      <SectionBackground image={BG_IMAGES.testimonials} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Trusted Daily By"
              title={<>The capital's most <em className="text-white not-italic">discerning</em> clients</>}
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} variant="3d" delay={i * 100}>
                <TiltCard className="rounded-2xl h-full">
                  <GlassCard className="h-full">
                    <div className="text-white text-2xl mb-3">"</div>
                    <p className="text-sm text-white/75 leading-relaxed italic">{t.quote}</p>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <div className="text-white font-medium text-sm">{t.name}</div>
                      <div className="text-[11px] text-white/45 tracking-widest uppercase mt-0.5">{t.role}</div>
                    </div>
                    <div className="flex gap-0.5 mt-3 text-white">
                      {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-current" />)}
                    </div>
                  </GlassCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      <GoldDivider />

      {/* CTA */}
      <SectionBackground image={BG_IMAGES.cta} overlay="dark" parallax className="py-24 px-6">
        <Reveal variant="3d">
          <div className="mx-auto max-w-5xl glass-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 glow-bg opacity-50" />
            <div className="relative">
              <div className="text-[11px] tracking-[0.5em] text-white uppercase mb-5">
                ✦ Reserve Your Chauffeur ✦
              </div>
              <h2 className="font-serif-lux text-4xl md:text-6xl text-white leading-tight">
                Your next arrival
                <br />
                should be unforgettable.
              </h2>
              <p className="mt-6 text-white/65 max-w-xl mx-auto">
                Book in 60 seconds. Available 24/7. Trusted by ambassadors, executives and discerning travelers across the DMV.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <GoldButton to="/booking">Book Now <ArrowRight className="h-4 w-4" /></GoldButton>
                <GoldButton href={`tel:${COMPANY.phoneRaw}`} variant="outline">
                  Call {COMPANY.phone}
                </GoldButton>
              </div>
            </div>
          </div>
        </Reveal>
      </SectionBackground>
    </div>
  );
}
