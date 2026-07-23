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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2 space-y-5">
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
              {/* Instagram */}
              <a href="https://www.instagram.com/shinelimos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="glass-gold w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/191fs3U9Sk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="glass-gold w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/12029517172" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="glass-gold w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              {/* Google */}
              <a href="https://maps.app.goo.gl/j7o5c1tepntGjpSf7?g_st=ic" target="_blank" rel="noopener noreferrer" aria-label="Google" className="glass-gold w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              </a>
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
                    {l.city} {l.region}
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
            <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold">Terms & Conditions</Link>
            <Link to="/faq" className="hover:text-gold">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
