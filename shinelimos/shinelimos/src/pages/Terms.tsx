import { Link } from "react-router-dom";
import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Clock, 
  ShieldAlert, 
  Wine, 
  AlertTriangle, 
  Car, 
  Baby, 
  MapPin, 
  Plane, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  Mail, 
  Phone,
  Briefcase
} from "lucide-react";
import { COMPANY } from "../data";

export default function Terms() {
  const sections = [
    {
      icon: Calendar,
      num: "1",
      title: "Reservations",
      content: [
        "Reservations may be made online, by phone, email, or text message.",
        "A reservation is considered confirmed only after you receive an official confirmation from Shine Limos LLC."
      ]
    },
    {
      icon: CreditCard,
      num: "2",
      title: "Payment",
      content: [
        "Payment is due before or at the time of service unless other arrangements have been made in advance.",
        "We accept major credit cards and other approved payment methods.",
        "Note: A 3% credit card processing fee applies to all credit card payments."
      ]
    },
    {
      icon: ShieldAlert,
      num: "3",
      title: "Cancellations & Refunds",
      subsections: [
        {
          heading: "Sedan & SUV Reservations",
          bullets: [
            "Cancel more than 24 hours before pickup: Full refund.",
            "Cancel within 24 hours of pickup: No refund."
          ]
        },
        {
          heading: "Sprinter Vans, Stretch Limousines & Party Buses",
          bullets: [
            "Cancel more than 7 days before service: Full refund.",
            "Cancel within 7 days of service: No refund unless otherwise stated."
          ]
        }
      ],
      content: [
        "Refunds, when applicable, will be processed back to the original payment method."
      ]
    },
    {
      icon: Clock,
      num: "4",
      title: "Waiting Time",
      subsections: [
        {
          heading: "Non-Airport Pickups",
          bullets: [
            "15 minutes of complimentary waiting time.",
            "After 15 minutes, waiting time is billed at $1.00 per minute."
          ]
        },
        {
          heading: "Airport Pickups",
          bullets: [
            "Complimentary wait time begins after the flight has landed.",
            "Flight tracking is included for commercial flights.",
            "Additional waiting time will be billed according to your reservation."
          ]
        }
      ]
    },
    {
      icon: Briefcase,
      num: "5",
      title: "Hourly Services",
      content: [
        "Hourly reservations are billed according to the minimum hourly requirement stated at the time of booking.",
        "Additional time requested during service will be billed in 30-minute or 1-hour increments, depending on vehicle availability."
      ]
    },
    {
      icon: ShieldAlert,
      num: "6",
      title: "Passenger Conduct",
      subtitle: "For the safety and comfort of everyone:",
      content: [
        "No smoking or vaping inside the vehicle.",
        "No illegal drugs or illegal activities.",
        "Seat belts must be worn when required by law.",
        "Passengers must follow all chauffeur instructions.",
        "Note: Shine Limos LLC reserves the right to terminate service without refund if passengers engage in unsafe, abusive, or illegal behavior."
      ]
    },
    {
      icon: AlertTriangle,
      num: "7",
      title: "Vehicle Damage",
      subtitle: "The customer is financially responsible for damage caused by passengers, including but not limited to:",
      content: [
        "Excessive cleaning required",
        "Vomiting or bodily fluids",
        "Burns or upholstery damage",
        "Broken interior or exterior components",
        "Stains or spillages",
        "Glass damage",
        "Note: Cleaning and repair charges will be billed directly to the credit card on file."
      ]
    },
    {
      icon: Wine,
      num: "8",
      title: "Alcohol",
      content: [
        "Alcohol is permitted only where allowed by applicable federal, state, and local laws.",
        "Passengers must comply with all applicable liquor laws.",
        "Note: No underage drinking is permitted under any circumstances."
      ]
    },
    {
      icon: Briefcase,
      num: "9",
      title: "Personal Belongings",
      content: [
        "Passengers are solely responsible for their personal belongings.",
        "Shine Limos LLC is not responsible for lost, stolen, or damaged items left inside the vehicle."
      ]
    },
    {
      icon: AlertTriangle,
      num: "10",
      title: "Delays",
      content: [
        "Traffic, weather, road closures, accidents, and other circumstances beyond our control may occasionally affect travel times.",
        "While we make every effort to provide timely service, Shine Limos LLC cannot guarantee exact arrival times under extraordinary circumstances."
      ]
    },
    {
      icon: Car,
      num: "11",
      title: "Vehicle Substitution",
      content: [
        "In rare situations due to maintenance, mechanical issues, or scheduling requirements, Shine Limos LLC reserves the right to substitute a comparable or upgraded vehicle at no additional charge."
      ]
    },
    {
      icon: Baby,
      num: "12",
      title: "Child Safety Seats",
      content: [
        "Child safety seats are the responsibility of the customer unless arranged in advance.",
        "Parents and guardians are responsible for ensuring children are properly secured according to applicable state laws."
      ]
    },
    {
      icon: MapPin,
      num: "13",
      title: "Additional Stops",
      content: [
        "Additional stops not included in the original reservation may result in additional charges."
      ]
    },
    {
      icon: Plane,
      num: "14",
      title: "Airport Flight Monitoring",
      content: [
        "Commercial airline arrivals are monitored whenever valid flight details are provided at booking.",
        "Please ensure accurate airline and flight number details are submitted when making your reservation."
      ]
    },
    {
      icon: Users,
      num: "15",
      title: "Affiliate Transportation",
      content: [
        "To better serve our clients, Shine Limos LLC may use trusted licensed affiliate transportation providers when necessary.",
        "All affiliate providers are expected to meet our strict professional service standards."
      ]
    },
    {
      icon: ShieldAlert,
      num: "16",
      title: "Limitation of Liability",
      content: [
        "Shine Limos LLC shall not be liable for delays, missed flights, missed appointments, indirect damages, or consequential damages resulting from circumstances beyond our reasonable control."
      ]
    },
    {
      icon: ShieldCheck,
      num: "17",
      title: "Privacy",
      content: [
        "Customer information is used solely to provide transportation services, process payments, and communicate regarding reservations.",
        "We do not sell or share personal information except as required by law or necessary to complete your reservation.",
        "Please refer to our Privacy Policy for complete details."
      ],
      hasPrivacyLink: true
    },
    {
      icon: CheckCircle,
      num: "18",
      title: "Acceptance",
      content: [
        "By booking transportation with Shine Limos LLC, you acknowledge that you have read, understood, and agree to these Terms & Conditions."
      ]
    }
  ];

  return (
    <div className="route-fade">
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        eyebrow="Legal"
        title={<>Terms & <em className="text-white not-italic">Conditions</em></>}
        subtitle="Welcome to Shine Limos LLC. Please review the terms & conditions governing our services."
      />

      <SectionBackground image="/images/pexels-photo-5288741.webp" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Card */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 glow-on-hover">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-serif-lux text-white uppercase tracking-wider">Terms & Conditions</h2>
                </div>
                <div className="text-xs text-white/55 font-mono">
                  Effective Date: July 23, 2026
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                Welcome to <strong className="text-white font-medium">Shine Limos LLC</strong>. By booking transportation services with Shine Limos LLC, you agree to the following Terms & Conditions.
              </p>
            </div>
          </Reveal>

          {/* Core Terms Sections */}
          <div className="grid gap-6 md:grid-cols-1">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Reveal key={idx} delay={idx * 40}>
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

                        {/* Subsections if present (e.g. Cancellations, Waiting Time) */}
                        {section.subsections && (
                          <div className="mt-4 space-y-4">
                            {section.subsections.map((sub, sIdx) => (
                              <div key={sIdx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-sm font-semibold text-gold mb-2">{sub.heading}</h4>
                                <ul className="space-y-2">
                                  {sub.bullets.map((bText, bIdx) => (
                                    <li key={bIdx} className="text-sm text-white/70 leading-relaxed font-light pl-4 list-disc list-inside">
                                      {bText}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Direct bullets/content */}
                        {section.content && (
                          <ul className="mt-4 space-y-2.5">
                            {section.content.map((item, bIdx) => {
                              const isNote = item.startsWith("Note:");
                              const isBullet = (section.subtitle || section.num === "1" || section.num === "2") && !isNote;

                              if (section.hasPrivacyLink && item.includes("Privacy Policy")) {
                                return (
                                  <li key={bIdx} className="text-sm text-white/70 leading-relaxed font-light">
                                    Please refer to our{" "}
                                    <Link to="/privacy" className="text-white underline hover:text-white/90">
                                      Privacy Policy
                                    </Link>{" "}
                                    for complete details on how we collect, use, and protect your information.
                                  </li>
                                );
                              }

                              if (isNote) {
                                return (
                                  <li key={bIdx} className="text-xs text-gold/90 italic mt-2 font-medium">
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
                        )}
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
              <h3 className="font-serif-lux text-2xl text-white mb-6">Contact Us</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                If you have any questions or concerns regarding these Terms & Conditions, please contact us:
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
      SectionBackground>
    </div>
  );
}
