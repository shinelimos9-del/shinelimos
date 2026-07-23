import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { COMPANY, SERVICES, LOCATIONS } from "../data";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close on route change
  useEffect(() => {
    setOpen(false);
    setOpenSub(null);
  }, [location.pathname]);

  const navLinkBase =
    "nav-underline text-sm tracking-[0.18em] uppercase font-light text-white/85 hover:text-white transition-colors";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-1.5 sm:py-2" : "py-2.5 sm:py-4"
      }`}
    >
      {/* Glass bar */}
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500 ${
          scrolled ? "scale-[0.99]" : "scale-100"
        }`}
      >
        <nav
          className={`glass-dark rounded-2xl px-5 sm:px-7 py-3 flex items-center justify-between transition-all ${
            scrolled ? "shadow-2xl shadow-black/60" : ""
          }`}
        >
          <Link to="/" aria-label="Home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden xl:flex items-center gap-8 ml-4 xl:ml-12">
            <li>
              <NavLink to="/" className={({ isActive }) => `${navLinkBase} ${isActive ? "active text-gold" : ""}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `${navLinkBase} ${isActive ? "active text-gold" : ""}`}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/fleet" className={({ isActive }) => `${navLinkBase} ${isActive ? "active text-gold" : ""}`}>
                Fleet
              </NavLink>
            </li>

            {/* Services dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setOpenSub("services")}
              onMouseLeave={() => setOpenSub(null)}
            >
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `${navLinkBase} flex items-center gap-1 ${isActive ? "active text-gold" : ""}`
                }
              >
                Services <ChevronDown className="h-3 w-3" />
              </NavLink>
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[640px] transition-all duration-300 ${
                  openSub === "services" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="glass-dark rounded-2xl p-6 grid grid-cols-2 gap-2">
                  {SERVICES.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      className="group rounded-xl px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="font-serif-lux text-base text-white group-hover:text-gold transition-colors">
                        {s.title}
                      </div>
                      <div className="text-xs text-white/55 mt-0.5 line-clamp-1">{s.short}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Locations dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setOpenSub("locations")}
              onMouseLeave={() => setOpenSub(null)}
            >
              <NavLink
                to="/locations"
                className={({ isActive }) =>
                  `${navLinkBase} flex items-center gap-1 ${isActive ? "active text-gold" : ""}`
                }
              >
                Locations <ChevronDown className="h-3 w-3" />
              </NavLink>
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[400px] transition-all duration-300 ${
                  openSub === "locations" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="glass-dark rounded-2xl p-4">
                  {LOCATIONS.map((l) => (
                    <Link
                      key={l.slug}
                      to={`/locations/${l.slug}`}
                      className="group flex items-center justify-between rounded-lg px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className="font-serif-lux text-white group-hover:text-gold transition-colors">
                        {l.city}
                      </span>
                      <span className="text-[10px] tracking-widest text-white/50">{l.region}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li>
              <NavLink to="/contact" className={({ isActive }) => `${navLinkBase} ${isActive ? "active text-gold" : ""}`}>
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Right CTAs */}
          <div className="hidden xl:flex items-center gap-4">
            <Link
              to="/admin-login"
              className="relative flex h-[42px] items-center justify-center rounded-full border border-white/20 bg-black/50 px-6 text-xs font-medium tracking-[0.15em] uppercase text-white transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Admin Login
            </Link>
            <Link
              to="/booking"
              className="relative flex h-[42px] items-center justify-center rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] px-6 text-xs font-bold tracking-[0.15em] uppercase text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] pulse-gold"
            >
              Quote & Book
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden glass rounded-full p-2.5"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5 text-gold" /> : <Menu className="h-5 w-5 text-gold" />}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        className={`xl:hidden fixed inset-x-0 top-[76px] sm:top-[88px] mx-2 sm:mx-4 lg:mx-6 transition-all duration-500 origin-top ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="glass-dark rounded-2xl p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          <MobileNav />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="glass rounded-xl py-3 text-center text-sm text-white"
            >
              <Phone className="inline h-4 w-4 mr-2 text-gold" />
              Call
            </a>
            <Link
              to="/booking"
              className="rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] py-3 text-center text-sm font-bold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              Quote & Book
            </Link>
          </div>
          <Link
            to="/admin-login"
            className="block w-full rounded-xl border border-white/20 bg-black/50 mt-3 py-3 text-center text-sm font-medium text-white transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const itemBase =
    "block py-3 text-sm tracking-[0.18em] uppercase text-white/85 hover:text-gold transition-colors border-b border-white/5";
  return (
    <ul>
      <li><NavLink to="/" className={itemBase}>Home</NavLink></li>
      <li><NavLink to="/about" className={itemBase}>About</NavLink></li>
      <li><NavLink to="/fleet" className={itemBase}>Fleet</NavLink></li>
      <li>
        <button
          onClick={() => setOpenGroup(openGroup === "s" ? null : "s")}
          className={`${itemBase} w-full flex items-center justify-between`}
        >
          Services <ChevronDown className={`h-4 w-4 transition-transform ${openGroup === "s" ? "rotate-180 text-gold" : ""}`} />
        </button>
        {openGroup === "s" && (
          <div className="py-2 pl-3">
            <NavLink to="/services" className="block py-2 text-xs text-gold/90">All Services →</NavLink>
            {SERVICES.map((s) => (
              <NavLink key={s.slug} to={`/services/${s.slug}`} className="block py-1.5 text-xs text-white/65 hover:text-gold">
                {s.title}
              </NavLink>
            ))}
          </div>
        )}
      </li>
      <li>
        <button
          onClick={() => setOpenGroup(openGroup === "l" ? null : "l")}
          className={`${itemBase} w-full flex items-center justify-between`}
        >
          Locations <ChevronDown className={`h-4 w-4 transition-transform ${openGroup === "l" ? "rotate-180 text-gold" : ""}`} />
        </button>
        {openGroup === "l" && (
          <div className="py-2 pl-3">
            <NavLink to="/locations" className="block py-2 text-xs text-gold/90">All Locations →</NavLink>
            {LOCATIONS.map((l) => (
              <NavLink key={l.slug} to={`/locations/${l.slug}`} className="block py-1.5 text-xs text-white/65 hover:text-gold">
                {l.city}, {l.region}
              </NavLink>
            ))}
          </div>
        )}
      </li>
      <li><NavLink to="/contact" className={itemBase}>Contact</NavLink></li>
    </ul>
  );
}
