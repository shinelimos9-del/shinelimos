import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Plane, Heart, Briefcase, Crown, Wine, Star, MapPin, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeading, GoldButton, GlassCard, GoldDivider } from "../components/ui";
import React, { Suspense } from "react";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import Parallax from "../components/Parallax";
import SectionBackground from "../components/SectionBackground";
import { getVehicles } from "../utils/api";

const BookingWidget = React.lazy(() => import("../components/BookingWidget"));
const Carousel = React.lazy(() => import("../components/Carousel"));
const FleetCarousel3D = React.lazy(() => import("../components/FleetCarousel3D"));
import { SERVICES, LOCATIONS, TESTIMONIALS, COMPANY } from "../data";
import SEO from "../components/SEO";

const SECONDARY_IMAGE =
  "/video/carvideo-ezgif.com-video-to-avif-converter.avif";

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
    image: "/images/pexels-photo-5288741.webp",
    subtitle: "Capitol Hill",
    title: "Where the Capital's most discerning travelers begin their day.",
  },
  {
    image: "/images/pexels-photo-11732276.webp",
    subtitle: "Lincoln Memorial",
    title: "Monumental moments deserve monumental arrivals.",
  },
  {
    image: "/images/pexels-photo-17893166.webp",
    subtitle: "After Hours",
    title: "Washington never sleeps. Neither do we.",
  },
  {
    image: "/images/pexels-photo-8425047.webp",
    subtitle: "The Fleet",
    title: "Hand-detailed, garage-kept, never more than three years young.",
  },
  {
    image: "/images/new%20car.webp",
    subtitle: "Wedding Service",
    title: "From first look to last dance, every moment perfectly choreographed.",
  },
  {
    image: "/images/pexels-photo-33598033.webp",
    subtitle: "Dulles & Reagan",
    title: "Flight-tracked airport transfers, twenty-four hours a day.",
  },
];

const BG_IMAGES = {
  services: "/images/new%20car.webp",
  showcase:
    "/images/pexels-photo-5288741.webp",
  fleet:
    "/images/pexels-photo-9411658.webp",
  whyUs:
    "/images/pexels-photo-8425047.webp",
  locations:
    "/images/pexels-photo-1545732.webp",
  testimonials:
    "/images/pexels-photo-14011664.webp",
  cta:
    "/images/pexels-photo-34440729.webp",
};

gsap.registerPlugin(useGSAP);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const fleetRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Defer video loading to let LCP text paint first
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchHomeVehicles();
          observer.disconnect();
        }
      },
      { rootMargin: "600px" } // Load well before it comes into view
    );
    if (fleetRef.current) observer.observe(fleetRef.current);
    return () => observer.disconnect();
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
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, force3D: true, lazy: false }
        );
      }

      if (videoEl) {
        tl.fromTo(
          videoEl,
          { scale: 1.08, filter: "blur(6px)" },
          { scale: 1, filter: "blur(0px)", duration: 1.6, force3D: true, lazy: false },
          0
        );
      }

      if (sidebarEl.length > 0) {
        tl.fromTo(
          sidebarEl,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, force3D: true, lazy: false },
          0.5
        );
      }
    },
    { scope: heroRef }
  );

  return (
    <div className="route-fade bg-black text-white">
      <SEO pageKey="home" />
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
              <span className="text-[10px] tracking-[0.4em] text-white/90 uppercase font-orbitron font-bold">Book Your Luxury Chauffeur</span>
              <div className="text-2xl font-serif-lux text-white mt-1">Instant Reservation</div>
            </div>
            <Suspense fallback={<div className="h-40 animate-pulse bg-white/5 rounded-xl"></div>}>
              <BookingWidget compact />
            </Suspense>
          </div>
        </div>
      )}

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-[#111111]">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-[#111111]">
          {videoLoaded && (
            <video
              autoPlay
              loop
              muted
              playsInline
              data-home-video
              className="absolute inset-0 w-full h-full object-cover scale-105"
            >
              <source src="/video/shine%20limos%204k.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 w-full flex flex-col lg:flex-row items-center gap-12 mt-12 lg:mt-0 z-10">
          {/* Left Content */}
          <div className="flex-1 text-left relative z-10 ml-0 lg:ml-24">

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.2] tracking-wide" data-home-fade style={{ fontFamily: "'Orbitron', sans-serif" }}>
              LUXURY <br />
              <span className="text-[#ff1100]">TRAVEL</span> EXPERIENCE
            </h1>

            <p className="mt-8 text-white/80 text-sm max-w-sm font-light leading-relaxed tracking-wider" data-home-fade>
              Our professional chauffeur service provides executive airport car service and luxury ground transportation for those who demand the very best.
            </p>



          </div>

        </div>


      </section>

      {/* MARQUEE BRANDS */}
      <section className="py-10 border-y border-white/5 overflow-hidden bg-black" aria-hidden="true">
        <div className="flex marquee w-max gap-16 text-white/40 text-xl md:text-2xl tracking-[0.3em] font-serif-lux">
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
              title={<>Executive & <em className="text-white not-italic">VIP Transportation</em></>}
              subtitle="Whether you need an executive airport car service or hourly VIP transportation, our luxury chauffeur service guarantees a seamless and prestigious ride."
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
                            <p className="mt-2 text-sm text-white/80 leading-relaxed font-light">{s.short}</p>
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
            <Suspense fallback={<div className="h-96 w-full animate-pulse bg-white/5 rounded-2xl"></div>}>
              <Carousel items={SHOWCASE_SLIDES} autoplay={5500} />
            </Suspense>
          </Reveal>
        </div>
      </SectionBackground>

      {/* 3D FLEET CAROUSEL */}
      <div ref={fleetRef}>
        <SectionBackground image={BG_IMAGES.fleet} overlay="dark" parallax className="py-24 px-6">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="The Fleet"
                title={<>Our <span className="text-white">Luxury Fleet.</span></>}
                subtitle="Discover our luxury fleet. From executive sedans to luxury SUVs, experience premium ground transportation tailored to your specific needs."
              />
            </Reveal>
            <Reveal variant="3d" delay={150} className="mt-14">
              <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-white/5 rounded-2xl"></div>}>
                <FleetCarousel3D vehicles={vehicles} />
              </Suspense>
            </Reveal>
            <div className="mt-8 text-center">
              <GoldButton to="/fleet" variant="outline">
                View Full Fleet <ArrowRight className="h-4 w-4" />
              </GoldButton>
            </div>
          </div>
        </SectionBackground>
      </div>

      {/* PARALLAX VIDEO STORY SECTION */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={SECONDARY_IMAGE}
            alt="The ShineLimos Standard"
            loading="lazy"
            width="1920"
            height="1080"
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
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
                      src="/images/car service.webp"
                      alt="Luxury Mercedes S-Class"
                      loading="lazy"
                      width="800"
                      height="1000"
                      className="absolute inset-0 w-full h-full object-contain p-4"
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
              title={<>Premium car service, <span className="text-white">every detail.</span></>}
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
              eyebrow="Our Locations"
              title={<>The <em className="text-white not-italic">DMV</em>, perfected.</>}
              subtitle="Providing luxury limo service and premium car service across Washington DC, Virginia, and Maryland."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 grid-cols-2 md:grid-cols-4">
            {LOCATIONS.map((l) => (
              <Link key={l.slug} to={`/locations/${l.slug}`}>
                <TiltCard intensity={15} className="rounded-2xl">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden glass group bg-neutral-900/60 border border-white/10 flex items-center justify-center">
                    <img
                      src={l.hero}
                      alt={l.city}
                      loading="lazy"
                      width="600"
                      height="450"
                      className="w-full h-full object-contain p-3 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 drop-shadow-xl"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-[#c9a96e] shrink-0" />
                        <div className="font-bold text-sm text-white uppercase tracking-wider leading-tight">
                          {l.city}
                        </div>
                      </div>
                      <div className="text-[10px] tracking-[0.25em] text-[#c9a96e] uppercase font-medium ml-5">{l.region}</div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
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
