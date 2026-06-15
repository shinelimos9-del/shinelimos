import { useNavigate, useLocation } from "react-router-dom";

export default function Logo({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      // Instantly scroll to top when transitioning pages
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center cursor-pointer select-none ${className}`}
    >
      <img
        src="/logo/logo.webp"
        alt="Limos Brand Icon"
        className="h-10 w-auto object-contain rounded-xl"
      />
    </div>
  );
}
