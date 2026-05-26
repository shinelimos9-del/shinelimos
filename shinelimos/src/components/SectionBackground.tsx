import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  image: string;
  overlay?: "dark" | "medium" | "light";
  parallax?: boolean;
  className?: string;
};

export default function SectionBackground({
  children,
  image,
  overlay = "dark",
  parallax = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !parallax) return;

      const imgEl = el.querySelector("[data-section-bg]") as HTMLElement | null;
      if (!imgEl) return;

      gsap.to(imgEl, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    },
    { scope: ref, dependencies: [parallax] }
  );

  const overlayClass =
    overlay === "dark"
      ? "bg-gradient-to-b from-black/88 via-black/78 to-black/92"
      : overlay === "medium"
      ? "bg-gradient-to-b from-black/75 via-black/62 to-black/82"
      : "bg-gradient-to-b from-black/55 via-black/45 to-black/65";

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Background image */}
      <div
        data-section-bg
        className="absolute inset-0 ken-burns"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: parallax ? "scale(1.18)" : "scale(1.05)",
        }}
      />
      {/* Dark overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)"
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
