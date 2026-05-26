import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Logo from "./Logo";
import { COMPANY, SERVICES, LOCATIONS } from "../data";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div
        className="absolute inset-x-0 -top-px h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-5">
            <Logo />
            <p className="text-sm text-white/60 leading-relaxed max-w-md">
              ShineLimos LLC is the Washington DC area's premier black car, limousine
              and chauffeur service. Discreet, punctual and impeccably maintained — for
              the people who move Washington.
            </p>
            <div className="space-y-2.5 text-sm text-white/70">
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold shrink-0" /><a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-gold">{COMPANY.phone}</a></div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold shrink-0" /><a href={`mailto:${COMPANY.email}`} className="hover:text-gold break-all">{COMPANY.email}</a></div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold shrink-0" />{COMPANY.address}</div>
              <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-gold shrink-0" />{COMPANY.hours}</div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: "IG", href: "https://www.instagram.com/shinelimos/" },
                { label: "FB", href: "#" },
                { label: "X", href: "#" },
                { label: "in", href: "#" }
              ].map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="glass-gold w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gold text-xs font-medium">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif-lux text-gold text-lg mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-white/65 hover:text-gold transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif-lux text-gold text-lg mb-4">Locations</h4>
            <ul className="space-y-2.5 text-sm">
              {LOCATIONS.map((l) => (
                <li key={l.slug}>
                  <Link to={`/locations/${l.slug}`} className="text-white/65 hover:text-gold transition-colors">
                    {l.city}, {l.region.slice(0,2).toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif-lux text-gold text-lg mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-white/65 hover:text-gold">Home</Link></li>
              <li><Link to="/about" className="text-white/65 hover:text-gold">About Us</Link></li>
              <li><Link to="/fleet" className="text-white/65 hover:text-gold">Our Fleet</Link></li>
              <li><Link to="/booking" className="text-white/65 hover:text-gold">Reservations</Link></li>
              <li><Link to="/contact" className="text-white/65 hover:text-gold">Contact</Link></li>
            </ul>
            <div className="mt-6 glass-gold rounded-xl p-4">
              <div className="text-[10px] tracking-widest text-gold uppercase mb-1">24/7 Dispatch</div>
              <a href={`tel:${COMPANY.phoneRaw}`} className="font-serif-lux text-xl text-white hover:text-gold">{COMPANY.phone}</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <div>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved. | Built by RizeWorld</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold">Privacy</Link>
            <Link to="/terms" className="hover:text-gold">Terms</Link>
            <Link to="/faq" className="hover:text-gold">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
