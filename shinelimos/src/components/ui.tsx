import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
      {eyebrow && (
        <div className="text-[11px] tracking-[0.4em] text-gold uppercase mb-4">
          ✦ {eyebrow} ✦
        </div>
      )}
      <h2 className="font-serif-lux text-4xl md:text-5xl lg:text-6xl leading-[1.05] gradient-gold-text">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-white/65 text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function GoldButton({
  to,
  href,
  children,
  variant = "solid",
  className = "",
  onClick,
  type,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-105";
  const styles =
    variant === "solid"
      ? "bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/30"
      : "glass border border-white/40 text-white hover:bg-white/10";

  const cls = `${base} ${styles} ${className}`;

  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-6 hover-lift ${className}`}>{children}</div>
  );
}

// Decorative gold divider
export function GoldDivider() {
  return (
    <div className="flex items-center justify-center my-12 gap-4">
      <div className="h-px w-24 bg-linear-to-r from-transparent to-gold/60" />
      <div className="w-2 h-2 rotate-45 bg-gold" />
      <div className="h-px w-24 bg-linear-to-l from-transparent to-gold/60" />
    </div>
  );
}

// Page hero wrapper with background image
export function PageHero({
  image,
  eyebrow,
  title,
  subtitle,
  video,
}: {
  image: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  video?: string;
}) {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = heroRef.current;
      if (!el) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const fadeEls = el.querySelectorAll("[data-hero-fade]");
      const mediaEl = el.querySelector("[data-hero-media]");
      const glowEl = el.querySelector("[data-hero-glow]");

      if (fadeEls.length > 0) {
        tl.fromTo(fadeEls,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.12, duration: 1 }
        );
      }

      if (mediaEl) {
        tl.fromTo(mediaEl,
          { scale: 1.08, filter: "blur(8px)" },
          { scale: 1, filter: "blur(0px)", duration: 1.4 },
          0
        );
      }

      if (glowEl) {
        gsap.to(glowEl, {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        });
      }
    },
    { scope: heroRef, dependencies: [image, video, title, subtitle, eyebrow] }
  );

  // Detect if image is a transparent removebg PNG
  const isTransparentPng = image.toLowerCase().includes("-removebg") || (image.toLowerCase().endsWith(".png") && !image.toLowerCase().includes("/car image/"));

  return (
    <section ref={heroRef} className="relative pt-28 pb-12 sm:pt-36 sm:pb-20 overflow-x-hidden min-h-[65vh] flex items-center">
      {/* Background layer */}
      {video ? (
        <div className="absolute inset-0 video-tint" data-hero-media>
          <video
            autoPlay muted loop playsInline preload="auto" poster={image}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src={video} type="video/mp4" />
          </video>
        </div>
      ) : isTransparentPng ? (
        /* Dark gradient background for transparent vehicle images */
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #080808 0%, #111111 40%, #181818 100%)" }} />
      ) : (
        <div
          className="absolute inset-0 ken-burns"
          data-hero-media
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.95) 100%), url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0" data-hero-glow />

      {isTransparentPng && !video ? (
        /* Special layout: text left + floating vehicle image right */
        <div className="relative mx-auto max-w-7xl px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text side */}
            <div className="text-left" data-hero-fade>
              {eyebrow && (
                <div className="text-[11px] tracking-[0.5em] text-white/70 uppercase mb-5">
                  ✦ {eyebrow} ✦
                </div>
              )}
              <h1 className="font-serif-lux text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-6 text-white/70 max-w-xl text-base md:text-lg leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {/* Vehicle image side */}
            <div className="relative flex items-center justify-center py-4" data-hero-fade>
              {/* Glow behind vehicle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)" }} />
              </div>
              <img
                src={image}
                alt={typeof title === "string" ? title : "Service vehicle"}
                className="relative w-full object-contain"
                style={{
                  maxHeight: "380px",
                  filter: "drop-shadow(0 24px 64px rgba(255,255,255,0.18))"
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Standard layout: centered text */
        <div className="relative mx-auto max-w-6xl px-6 text-center zoom-3d w-full">
          {eyebrow && (
            <div className="text-[11px] tracking-[0.5em] text-white uppercase mb-5" data-hero-fade>
              ✦ {eyebrow} ✦
            </div>
          )}
          <h1 className="font-serif-lux text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-white" data-hero-fade>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-white/75 max-w-2xl mx-auto text-base md:text-lg leading-relaxed" data-hero-fade>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
