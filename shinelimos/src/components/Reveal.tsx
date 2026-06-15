// Scroll-triggered reveal wrapper powered by GSAP + ScrollTrigger
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Variant = "up" | "3d" | "left" | "right";

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
    const el = ref.current;
    if (!el) return;
    const baseFrom =
      variant === "left"
        ? { opacity: 0, x: -80, rotateY: -15, transformPerspective: 1200 }
        : variant === "right"
        ? { opacity: 0, x: 80, rotateY: 15, transformPerspective: 1200 }
        : variant === "3d"
        ? { opacity: 0, y: 70, rotateX: 14, scale: 0.94, transformPerspective: 1200 }
        : { opacity: 0, y: 56 };

    const baseTo = { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      rotateX: 0, 
      rotateY: 0, 
      scale: 1, 
      duration: 1.1, 
      ease: "power3.out",
      force3D: true, // Force GPU acceleration
      lazy: false // Prevent batching reflows which causes Lighthouse thrashing errors
    };

    gsap.fromTo(el, baseFrom, {
      ...baseTo,
      delay: delay / 1000,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
        preventOverlaps: true, // Optimizes performance when scrolling fast
        fastScrollEnd: true,
      },
    });
  },
    { scope: ref, dependencies: [variant, delay] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
