import { Link } from "react-router-dom";
import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { FileText, Calendar, ShieldAlert, UserCheck, Settings, ShieldCheck, Mail, Phone } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: Calendar,
      num: "1",
      title: "Booking & Payment",
      content: [
        "All reservations must be confirmed in advance and are subject to availability.",
        "A valid credit card is required to secure your booking.",
        "Full payment may be required prior to service, depending on the type of reservation."
      ]
    },
    {
      icon: ShieldAlert,
      num: "2",
      title: "Cancellation Policy",
      content: [
        "Cancellations must be made at least:",
        "• 24 hours in advance for Sprinters and Buses",
        "• 12 hours in advance for SUVs and Sedans",
        "Failure to do so may result in a cancellation fee.",
        "No-shows will be charged the full amount of the trip.",
        "For group events, weddings, or specialty vehicles, separate cancellation policies may apply."
      ]
    },
    {
      icon: ShieldAlert,
      num: "3",
      title: "Delays & Liability",
      content: [
        "ShineLimos LLC is not responsible for delays caused by traffic, weather, road conditions, or other factors beyond our control.",
        "While we strive to provide timely service, we cannot guarantee arrival or departure times in such cases.",
        "We are not liable for missed flights, appointments, or events due to uncontrollable delays."
      ]
    },
    {
      icon: UserCheck,
      num: "4",
      title: "Client Responsibilities",
      content: [
        "Clients must ensure all information provided (pickup location, time, number of passengers, etc.) is accurate.",
        "Any damage to the vehicle caused by the client or their guests will be the client’s responsibility.",
        "No smoking, illegal substances, or unruly behavior is allowed in any vehicle."
      ]
    },
    {
      icon: Settings,
      num: "5",
      title: "Changes to Service",
      content: [
        "ShineLimos LLC reserves the right to upgrade vehicles or make necessary changes to ensure timely and quality service.",
        "We reserve the right to refuse service to any client for safety or legal reasons."
      ]
    },
    {
      icon: ShieldCheck,
      num: "6",
      title: "Privacy",
      content: [
        "Please refer to our Privacy Policy for how we collect, use, and protect your information."
      ],
      link: { text: "Privacy Policy", to: "/privacy" }
    }
  ];

  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/15200595/pexels-photo-15200595.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        eyebrow="Legal"
        title={<>Terms & <em className="text-white not-italic">Conditions</em></>}
        subtitle="Please review the rules, guidelines, and terms that govern your relationship with ShineLimos LLC."
      />

      <SectionBackground image="https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Card */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 glow-on-hover">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-serif-lux text-white uppercase tracking-wider">Terms of Service</h2>
                </div>
                <div className="text-xs text-white/55 font-mono">
                  Effective Date: 04/06/2025
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                By using our website and booking our services, you agree to the following terms and conditions. Please read them carefully before proceeding. All services are operated under the company name <strong className="text-white font-medium">ShineLimos LLC</strong>.
              </p>
            </div>
          </Reveal>

          {/* Core Terms Sections */}
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
                            // Render list elements elegantly
                            const isBullet = bullet.startsWith("• ");
                            const text = isBullet ? bullet.slice(2) : bullet;

                            if (section.link && text.includes("Privacy Policy")) {
                              return (
                                <li key={bIdx} className="text-sm text-white/70 leading-relaxed font-light">
                                  Please refer to our{" "}
                                  <Link to="/privacy" className="text-white underline hover:text-white/90">
                                    Privacy Policy
                                  </Link>{" "}
                                  for how we collect, use, and protect your information.
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
                For questions or concerns regarding these terms, please contact us:
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
