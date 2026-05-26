import { useState } from "react";
import { PageHero, SectionHeading, GoldButton, GlassCard } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import Reveal from "../components/Reveal";
import { COMPANY } from "../data";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

const BG = {
  contact: "https://images.pexels.com/photos/9411653/pexels-photo-9411653.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
};

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4500);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        video="https://videos.pexels.com/video-files/13643097/13643097-uhd_3840_2160_24fps.mp4"
        eyebrow="Contact"
        title={<>At your <em className="text-white not-italic">service</em>, 24/7</>}
        subtitle="Our concierge team is available around the clock. Reservations, quotes, corporate accounts — we're a phone call away."
      />

      <SectionBackground image={BG.contact} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <Reveal variant="left">
            <div className="glass-dark rounded-3xl p-8 md:p-10">
              <SectionHeading align="left" eyebrow="Send us a message" title={<>Get in <span className="text-white">touch</span></>} />
              <form onSubmit={onSubmit} className="mt-8 grid gap-5">
                <Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <div className="grid md:grid-cols-2 gap-5">
                  <Input label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <Input label="Phone Number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                </div>
                <Textarea label="Message" value={form.message} onChange={(v) => setForm({ ...form, message: v })} required />
                <div>
                  <GoldButton type="submit">
                    Send Message <Send className="h-4 w-4" />
                  </GoldButton>
                </div>
                {sent && (
                  <div className="flex items-center gap-3 glass-gold rounded-xl p-4 text-sm text-white">
                    <CheckCircle className="h-5 w-5" />
                    Thank you — your message has been received. We'll respond within one hour.
                  </div>
                )}
              </form>
            </div>
          </Reveal>

          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: Phone, title: "24/7 Reservation Line", value: COMPANY.phone, href: `tel:${COMPANY.phoneRaw}` },
              { icon: Mail, title: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { icon: MapPin, title: "Headquarters", value: COMPANY.address },
              { icon: Clock, title: "Hours", value: COMPANY.hours },
            ].map((c, i) => (
              <Reveal key={c.title} variant="right" delay={i * 100}>
                <GlassCard>
                  <div className="flex items-start gap-4">
                    <div className="glass-gold w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.3em] text-white uppercase">{c.title}</div>
                      {c.href ? (
                        <a href={c.href} className="font-serif-lux text-xl text-white hover:text-white/80 transition-colors mt-1 block">
                          {c.value}
                        </a>
                      ) : (
                        <div className="font-serif-lux text-xl text-white mt-1">{c.value}</div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}

            {/* Map */}
            <Reveal variant="right" delay={400}>
              <div className="glass rounded-2xl overflow-hidden h-64 relative">
                <iframe
                  title="ShineLimos HQ"
                  src="https://maps.google.com/maps?q=13455+Sunrise+Valley+drive+Herndon+Virginia+20171&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full grayscale contrast-125 opacity-80"
                  style={{ filter: "invert(0.92) hue-rotate(180deg)" }}
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </SectionBackground>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-1.5 block">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/5 transition-all"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-1.5 block">{label}</span>
      <textarea
        required={required}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/5 transition-all resize-none"
      />
    </label>
  );
}
