import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { 
  ShieldAlert, 
  Car, 
  Bus, 
  CreditCard, 
  AlertTriangle, 
  Mail, 
  Phone 
} from "lucide-react";
import { COMPANY } from "../data";

export default function CancellationPolicy() {
  const policies = [
    {
      icon: Car,
      title: "Luxury Sedan & Luxury SUV",
      description: "Free cancellation up to 24 hours before the scheduled pickup. Cancellations made within 24 hours or no-shows will be charged 100% of the reservation total."
    },
    {
      icon: Bus,
      title: "Mercedes Sprinter, Mini Coach & Motor Coach",
      description: "Free cancellation up to 7 days before the scheduled pickup. Cancellations made within 7 days or no-shows will be charged 100% of the reservation total."
    },
    {
      icon: CreditCard,
      title: "Refund Method",
      description: "Refunds, when applicable, will be issued to the original payment method."
    },
    {
      icon: AlertTriangle,
      title: "Reservation Modifications & Weather Policy",
      description: "Shine Limos reserves the right to cancel or modify a reservation due to severe weather, unsafe conditions, or circumstances beyond our control."
    }
  ];

  return (
    <div className="route-fade">
      {/* Page Hero */}
      <PageHero
        image="/images/pexels-photo-15200595.webp"
        eyebrow="Legal"
        title={<>Cancellation <em className="text-white not-italic">& Refund Policy</em></>}
        subtitle="Transparent terms and clear cancellation rules for your journey."
      />

      <SectionBackground image="/images/pexels-photo-8425047.webp" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Card */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 glow-on-hover">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-serif-lux text-white uppercase tracking-wider">Cancellation Policy</h2>
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                At <strong className="text-white font-medium">Shine Limos LLC</strong>, we understand plans change. Our cancellation policy ensures fairness to both our clients and our chauffeurs who reserve dedicated time for your journey.
              </p>
            </div>
          </Reveal>

          {/* Policy Points */}
          <div className="grid gap-6 md:grid-cols-1">
            {policies.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={idx} delay={idx * 50}>
                  <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="glass-gold w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white mt-1">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className="font-serif-lux text-xl text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/75 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Contact Support Section */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 mt-12 bg-linear-to-b from-white/5 to-transparent">
              <h3 className="font-serif-lux text-2xl text-white mb-4">Need Help or Have Questions?</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light mb-6">
                If you have questions regarding a pending reservation or need to make immediate changes, please contact our dispatch team.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-gold rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] tracking-widest text-white/50 uppercase mb-2">Corporate Office</div>
                  <div className="font-serif-lux text-lg text-white">{COMPANY.name}</div>
                  <div className="text-xs text-white/60 mt-1 leading-relaxed">
                    {COMPANY.address}
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
                      <div className="text-[9px] tracking-widest text-white/40 uppercase">Call Support 24/7</div>
                      <a href={`tel:${COMPANY.phoneRaw}`} className="block text-sm text-white hover:text-white/80 font-mono">
                        {COMPANY.phone}
                      </a>
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
