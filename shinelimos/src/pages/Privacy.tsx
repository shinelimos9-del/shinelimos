import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { ShieldCheck, Database, Settings, Share2, Lock, Cookie, UserCheck, Mail, Phone } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      num: "1",
      title: "Information We Collect",
      content: [
        "Name, phone number, email address, and billing details",
        "Pickup and drop-off locations, travel preferences, and special requests",
        "Payment information (processed securely via third-party providers)",
        "Website usage data (such as IP address and browser type)"
      ]
    },
    {
      icon: Settings,
      num: "2",
      title: "How We Use Your Information",
      content: [
        "Process reservations and provide transportation services",
        "Communicate with you about your booking",
        "Improve our services and customer experience",
        "Send updates, confirmations, or promotional content (only with your consent)"
      ]
    },
    {
      icon: Share2,
      num: "3",
      title: "Information Sharing",
      content: [
        "We do not sell, rent, or share your personal information with third parties except:",
        "• When required by law or government authorities",
        "• To trusted service providers who assist in delivering our services (under confidentiality agreements)"
      ]
    },
    {
      icon: Lock,
      num: "4",
      title: "Data Security",
      content: [
        "We take reasonable steps to protect your information through secure servers, encrypted communications, and restricted access to personal data."
      ]
    },
    {
      icon: Cookie,
      num: "5",
      title: "Cookies & Tracking",
      content: [
        "Our website may use cookies to enhance your browsing experience and track website performance. You can disable cookies in your browser settings at any time."
      ]
    },
    {
      icon: UserCheck,
      num: "6",
      title: "Your Rights",
      content: [
        "You have the right to:",
        "• Access the personal data we hold about you",
        "• Request corrections or deletions",
        "• Opt out of promotional communications",
        "To exercise these rights, please contact us at: booking@shinelimos.com"
      ]
    }
  ];

  return (
    <div className="route-fade">
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        eyebrow="Legal"
        title={<>Privacy & <em className="text-white not-italic">Policy</em></>}
        subtitle="Learn how ShineLimos LLC collects, uses, and safeguards your personal data."
      />

      <SectionBackground image="/images/pexels-photo-8425047.webp" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Card */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 glow-on-hover">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-serif-lux text-white uppercase tracking-wider">Privacy Policy</h2>
                </div>
                <div className="text-xs text-white/55 font-mono">
                  Effective Date: 04/06/2025
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                At <strong className="text-white font-medium">ShineLimos LLC</strong>, we value your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our services or visit our website.
              </p>
            </div>
          </Reveal>

          {/* Core Privacy Sections */}
          <div className="grid gap-6 md:grid-cols-1">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Reveal key={idx} delay={idx * 80}>
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="glass-gold w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif-lux text-xl text-white tracking-wide">
                          {section.num}. {section.title}
                        </h3>
                        <ul className="mt-4 space-y-3">
                          {section.content.map((bullet, bIdx) => {
                            const isBullet = bullet.startsWith("• ");
                            const text = isBullet ? bullet.slice(2) : bullet;

                            if (text.includes("booking@shinelimos.com")) {
                              return (
                                <li key={bIdx} className="text-sm text-white/70 leading-relaxed font-light">
                                  To exercise these rights, please contact us at:{" "}
                                  <a href="mailto:booking@shinelimos.com" className="text-white underline font-mono">
                                    booking@shinelimos.com
                                  </a>
                                </li>
                              );
                            }

                            return (
                              <li
                                key={bIdx}
                                className={`text-sm text-white/70 leading-relaxed font-light ${
                                  isBullet ? "pl-4 list-disc list-inside" : ""
                                }`}
                              >
                                {text}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Contact Section */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 mt-12 bg-linear-to-b from-white/2 to-transparent">
              <h3 className="font-serif-lux text-2xl text-white mb-6">7. Contact Us</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                If you have any questions about this Privacy Policy, please contact:
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-gold rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Corporate Office</div>
                  <div className="font-serif-lux text-lg text-white">ShineLimos LLC</div>
                  <div className="text-xs text-white/60 mt-1 leading-relaxed">
                    13455 Sunrise Valley drive<br />
                    Herndon Virginia 20171
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[9px] tracking-widest text-white/40 uppercase">Email Us</div>
                      <a href="mailto:booking@shinelimos.com" className="text-sm text-white hover:text-white/80 font-mono">
                        booking@shinelimos.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 mt-0.5">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[9px] tracking-widest text-white/40 uppercase">Call Support</div>
                      <div className="space-y-1">
                        <a href="tel:+17035956269" className="block text-sm text-white hover:text-white/80 font-mono">
                          +1 703 595 6269
                        </a>
                        <a href="tel:+12029517172" className="block text-sm text-white hover:text-white/80 font-mono">
                          +1 202 951 7172
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </SectionBackground>
    </div>
  );
}
