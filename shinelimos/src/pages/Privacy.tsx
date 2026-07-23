import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { 
  ShieldCheck, 
  Database, 
  Settings, 
  CreditCard,
  Cookie, 
  Share2, 
  Lock, 
  MessageSquare, 
  UserCheck, 
  ExternalLink, 
  Baby, 
  FileText, 
  Mail, 
  Phone 
} from "lucide-react";
import { COMPANY } from "../data";

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      num: "1",
      title: "Information We Collect",
      subtitle: "We may collect the following information:",
      content: [
        "Full name",
        "Email address",
        "Phone number",
        "Pickup and drop-off locations",
        "Travel dates and times",
        "Flight information (if applicable)",
        "Payment information",
        "IP address and browser information",
        "Any information you provide through our contact or booking forms"
      ]
    },
    {
      icon: Settings,
      num: "2",
      title: "How We Use Your Information",
      subtitle: "We use your information to:",
      content: [
        "Confirm and manage reservations",
        "Provide transportation services",
        "Process payments",
        "Communicate about your booking",
        "Respond to customer inquiries",
        "Improve our website and services",
        "Prevent fraud and unauthorized transactions",
        "Comply with legal obligations"
      ]
    },
    {
      icon: CreditCard,
      num: "3",
      title: "Payment Information",
      content: [
        "Payments are processed through secure third-party payment providers.",
        "Shine Limos LLC does not store your complete credit or debit card information on our servers."
      ]
    },
    {
      icon: Cookie,
      num: "4",
      title: "Cookies & Analytics",
      subtitle: "Our website may use cookies and similar technologies to:",
      content: [
        "Improve website performance",
        "Remember your preferences",
        "Analyze website traffic",
        "Enhance your browsing experience",
        "Note: You can disable cookies through your browser settings, although some website features may not function properly."
      ]
    },
    {
      icon: Share2,
      num: "5",
      title: "Information Sharing",
      subtitle: "We do not sell, rent, or trade your personal information. We may share your information only with:",
      content: [
        "Trusted affiliate transportation providers when necessary to fulfill your reservation",
        "Payment processors",
        "Technology providers who help operate our website",
        "Government authorities when required by law",
        "Note: All service providers are expected to protect your information."
      ]
    },
    {
      icon: Lock,
      num: "6",
      title: "Data Security",
      content: [
        "We use reasonable administrative, technical, and physical safeguards to protect your personal information against unauthorized access, disclosure, or misuse.",
        "However, no method of transmission over the internet is completely secure."
      ]
    },
    {
      icon: MessageSquare,
      num: "7",
      title: "Marketing Communications",
      content: [
        "If you choose to receive promotional emails or text messages, you may unsubscribe at any time by following the instructions in the message or by contacting us directly."
      ]
    },
    {
      icon: UserCheck,
      num: "8",
      title: "Your Rights",
      subtitle: "Depending on applicable law, you may have the right to:",
      content: [
        "Request access to your personal information",
        "Request corrections to inaccurate information",
        "Request deletion of your personal information",
        "Withdraw consent where applicable",
        "To make a request, please contact us using the information below."
      ]
    },
    {
      icon: ExternalLink,
      num: "9",
      title: "Third-Party Links",
      content: [
        "Our website may contain links to third-party websites. Shine Limos LLC is not responsible for the privacy practices or content of those websites."
      ]
    },
    {
      icon: Baby,
      num: "10",
      title: "Children’s Privacy",
      content: [
        "Our services are not intended for children under the age of 13, and we do not knowingly collect personal information from children."
      ]
    },
    {
      icon: FileText,
      num: "11",
      title: "Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated Effective Date."
      ]
    }
  ];

  return (
    <div className="route-fade">
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        eyebrow="Legal"
        title={<>Privacy & <em className="text-white not-italic">Policy</em></>}
        subtitle="Learn how Shine Limos LLC collects, uses, stores, and safeguards your personal data."
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
                  Effective Date: July 23, 2026
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                At <strong className="text-white font-medium">Shine Limos LLC</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website or book our transportation services.
              </p>
            </div>
          </Reveal>

          {/* Core Privacy Sections */}
          <div className="grid gap-6 md:grid-cols-1">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Reveal key={idx} delay={idx * 50}>
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="glass-gold w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif-lux text-xl text-white tracking-wide">
                          {section.num}. {section.title}
                        </h3>

                        {section.subtitle && (
                          <p className="text-sm text-white/80 mt-2 font-medium">
                            {section.subtitle}
                          </p>
                        )}

                        <ul className="mt-4 space-y-2.5">
                          {section.content.map((item, bIdx) => {
                            const isNote = item.startsWith("Note:");
                            const isBullet = section.subtitle && !isNote;

                            if (isNote) {
                              return (
                                <li key={bIdx} className="text-xs text-white/60 italic mt-2">
                                  {item}
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
                                {item}
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
              <h3 className="font-serif-lux text-2xl text-white mb-6">12. Contact Us</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                If you have any questions about this Privacy Policy or how we handle your information, please contact us.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-gold rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Corporate Office</div>
                  <div className="font-serif-lux text-lg text-white">{COMPANY.name}</div>
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
                      <a href={`mailto:${COMPANY.email}`} className="text-sm text-white hover:text-white/80 font-mono">
                        {COMPANY.email}
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
                        <a href={`tel:${COMPANY.phoneRaw}`} className="block text-sm text-white hover:text-white/80 font-mono">
                          {COMPANY.phone}
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
