import { useState } from "react";
import { PageHero, SectionHeading, GoldButton, GlassCard, GoldDivider } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import Reveal from "../components/Reveal";
import { COMPANY } from "../data";
import { Building2, Hotel, Plane, ShieldCheck, Mail, Phone, Clock, FileText, CheckCircle, Send, Users, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

const BG = {
  hero: "/images/pexels-photo-34440729.webp",
  content: "/images/pexels-photo-14011664.webp",
  form: "/images/pexels-photo-8605325.webp",
};

export default function Corporate() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    type: "Corporate",
    monthlyVolume: "",
    message: ""
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipientEmail = form.type === "Affiliate" ? "affiliate@shinelimos.com" : "booking@shinelimos.com";
    const subject = encodeURIComponent(`New ${form.type} Partner Inquiry - ${form.companyName}`);
    const body = encodeURIComponent(
      `Company: ${form.companyName}\n` +
      `Contact Name: ${form.contactName}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone}\n` +
      `Partner Type: ${form.type}\n` +
      `Monthly Ride Volume: ${form.monthlyVolume || 'Not specified'}\n\n` +
      `Message:\n${form.message}`
    );

    // Open mailto link
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Trigger conversion event if configured
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-17781178463/hboFCJaPjewcEN-A3Z5C",
      });
    }

    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      type: "Corporate",
      monthlyVolume: "",
      message: ""
    });
  };

  return (
    <div className="route-fade">
      <SEO 
        pageKey="corporate"
        title="Corporate Accounts & Affiliate Partners | Shine Limos"
        description="Direct billing, priority dispatch, and a vetted DMV chauffeur network for companies, hotels, travel advisors, and affiliate operators."
      />
      <PageHero
        image={BG.hero}
        eyebrow="Corporate & Affiliates"
        title={<>Corporate Accounts & <em className="text-white not-italic">Affiliate Partners</em></>}
        subtitle="Direct billing, priority dispatch, and a vetted DMV chauffeur network — for companies, hotels, travel advisors, and affiliate operators."
      />

      {/* 3 Value Pillars */}
      <SectionBackground image={BG.content} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Partnership Programs"
              title={<>Tailored Solutions for <span className="text-white">Every Organization</span></>}
            />
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {/* 1. Corporate Accounts */}
            <Reveal variant="3d" delay={100}>
              <GlassCard className="h-full flex flex-col justify-between p-8 border-gold/20">
                <div>
                  <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-serif-lux text-2xl text-white mb-3">Corporate Accounts</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Designed for companies, law firms, and embassies demanding seamless executive mobility.
                  </p>
                  <ul className="space-y-3 text-sm text-white/80 mb-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>One monthly invoice:</strong> Direct billing with no per-trip card charges.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Priority booking:</strong> Guaranteed dispatch for executives, roadshows, and airport transfers.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Dedicated account contact:</strong> 24/7 direct phone and dispatch support.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-white/10 bg-white/5 -mx-8 -mb-8 p-6 rounded-b-2xl">
                  <div className="text-[11px] uppercase tracking-wider text-gold font-bold mb-2">Corporate Rates</div>
                  <div className="text-xs text-white/70 space-y-1 mb-4">
                    <div>Sedans from <strong>$85/hr</strong> · SUVs from <strong>$105/hr</strong></div>
                    <div>S-Class from <strong>$125/hr</strong> · Sprinters from <strong>$135/hr</strong></div>
                    <div className="text-[10px] text-white/50">(3-hour minimum; airport transfers from $95)</div>
                  </div>
                  <div className="text-xs text-white/80">
                    Direct Contact: <a href="tel:+12029517172" className="text-gold font-bold hover:underline">(202) 951-7172</a>
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* 2. Hotels & Travel Advisors */}
            <Reveal variant="3d" delay={200}>
              <GlassCard className="h-full flex flex-col justify-between p-8">
                <div>
                  <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center mb-6">
                    <Hotel className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-serif-lux text-2xl text-white mb-3">Hotels & Travel Advisors</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Trusted white-glove chauffeur partner for five-star hospitality concierge desks and travel managers.
                  </p>
                  <ul className="space-y-3 text-sm text-white/80 mb-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Preferred-partner service:</strong> Commission-protected reservations for your guests.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Vetted professional chauffeurs:</strong> Background-checked, NDA-bound, suited drivers.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Pristine fleet:</strong> Late-model Cadillac, Mercedes, and Lincoln vehicles with complimentary water & WiFi.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Flight tracking:</strong> Automatic monitoring on every IAD, DCA, and BWI pickup.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-white/10 bg-white/5 -mx-8 -mb-8 p-6 rounded-b-2xl">
                  <div className="text-xs text-white/80 mb-2">Concierge Desk Inquiries:</div>
                  <a href="mailto:booking@shinelimos.com" className="text-gold font-bold text-sm hover:underline block">
                    booking@shinelimos.com
                  </a>
                  <div className="text-[11px] text-white/50 mt-1">24/7 Direct line: (202) 951-7172</div>
                </div>
              </GlassCard>
            </Reveal>

            {/* 3. Affiliate Operators */}
            <Reveal variant="3d" delay={300}>
              <GlassCard className="h-full flex flex-col justify-between p-8 border-gold/20">
                <div>
                  <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-serif-lux text-2xl text-white mb-3">Affiliate Operators</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Join our premier DMV chauffeur partner network or farm out Washington DC trips with 100% confidence.
                  </p>
                  <ul className="space-y-3 text-sm text-white/80 mb-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Full compliance:</strong> Current commercial liability insurance and DFHV licenses required.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>Strict standards:</strong> Late-model black sedans, SUVs, and Sprinters only.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span><strong>On-time guarantee:</strong> Status updates and live tracking for all affiliate dispatch runs.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-white/10 bg-white/5 -mx-8 -mb-8 p-6 rounded-b-2xl">
                  <div className="text-xs text-white/80 mb-2">Affiliate Network Desk:</div>
                  <a href="mailto:affiliate@shinelimos.com" className="text-gold font-bold text-sm hover:underline block">
                    affiliate@shinelimos.com
                  </a>
                  <div className="text-[11px] text-white/50 mt-1">Direct contact: (202) 951-7172</div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </SectionBackground>

      <GoldDivider />

      {/* Partner Application Form */}
      <SectionBackground image={BG.form} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass-dark rounded-3xl p-8 md:p-12 border border-white/15 shadow-2xl">
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold mb-2">Partner Application</div>
                <h2 className="font-serif-lux text-3xl md:text-4xl text-white">Open an Account or Join Our Network</h2>
                <p className="text-white/60 text-sm mt-3">
                  Submit your details below. Affiliate inquiries are automatically routed to <strong className="text-white">affiliate@shinelimos.com</strong>; corporate & concierge inquiries to <strong className="text-white">booking@shinelimos.com</strong>.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Company Name *</span>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="e.g. Acme Corporation or Global Travel"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Contact Name *</span>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Email Address *</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="corporate@company.com"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Phone Number *</span>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(202) 555-0100"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Organization Type *</span>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-all"
                    >
                      <option className="bg-[#111]" value="Corporate">Corporate Account</option>
                      <option className="bg-[#111]" value="Hotel">Hotel / Concierge Desk</option>
                      <option className="bg-[#111]" value="Travel Advisor">Travel Advisor / Agency</option>
                      <option className="bg-[#111]" value="Affiliate">Affiliate Chauffeur Operator</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Monthly Ride Volume (Optional)</span>
                    <input
                      type="text"
                      value={form.monthlyVolume}
                      onChange={(e) => setForm({ ...form, monthlyVolume: e.target.value })}
                      placeholder="e.g. 5–15 trips/month"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-1.5 block">Message / Requirements</span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your billing requirements, fleet needs, or affiliate capabilities..."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold focus:bg-black/80 transition-all resize-none"
                  />
                </label>

                <div className="pt-2 text-center">
                  <GoldButton type="submit">
                    Submit Partner Request <Send className="w-4 h-4 ml-2" />
                  </GoldButton>
                </div>

                {sent && (
                  <div className="flex items-center justify-center gap-3 glass-gold rounded-xl p-4 text-sm text-white animate-in fade-in">
                    <CheckCircle className="h-5 w-5 text-gold" />
                    Thank you! Your inquiry has been forwarded to our accounts team. We will reach out shortly.
                  </div>
                )}
              </form>
            </div>
          </Reveal>
        </div>
      </SectionBackground>
    </div>
  );
}
