// 3D mouse-tilt card with glare effect
import { useRef, useState, type ReactNode } from "react";

export default function TiltCard({
  children,
  className = "",
  intensity = 12,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (y - 0.5) * -intensity;
    const ry = (x - 0.5) * intensity;
    setTransform(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`);
    setGlare({ x: x * 100, y: y * 100, o: 0.18 });
  };

  const onLeave = () => {
    setTransform("perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)");
    setGlare({ x: 50, y: 50, o: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d", transition: "transform 0.18s ease-out" }}
      className={`relative ${className}`}
    >
      {children}
      {/* Glare */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.o}) 0%, transparent 50%)`,
          transition: "opacity 0.3s",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
