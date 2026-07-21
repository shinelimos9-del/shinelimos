// Full-screen background video with poster fallback
import { useRef, useEffect } from "react";

export default function VideoHero({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);
  return (
    <div className={`absolute inset-0 overflow-hidden video-tint ${className}`}>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
