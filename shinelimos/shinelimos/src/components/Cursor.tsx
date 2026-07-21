// Custom luxury cursor (dot + ring) that follows mouse with subtle 3D lag
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch
    let dx = 0, dy = 0, rx = 0, ry = 0, mx = 0, my = 0;
    let raf = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dx - 4}px, ${dy - 4}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[99] hidden md:block">
        <div className="w-9 h-9 rounded-full border border-white/40" />
      </div>
    </>
  );
}
