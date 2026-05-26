import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { HelpCircle, Clock, ShieldCheck, Plane, Car, CreditCard } from "lucide-react";

export default function Faq() {
  const faqs = [
    {
      icon: Clock,
      question: "How far in advance should I book my reservation?",
      answer: "We recommend booking at least 24 hours in advance to ensure availability, especially for specialty vehicles or peak times. However, we can often accommodate last-minute requests depending on our fleet schedule."
    },
    {
      icon: CreditCard,
      question: "What is your cancellation policy?",
      answer: "We require at least a 12-hour notice for cancellations on standard sedans and SUVs without penalty. Sprinter vans, buses, and specialty vehicles require at least a 24-hour notice. Late cancellations may incur a fee up to the full trip amount."
    },
    {
      icon: ShieldCheck,
      question: "Are your chauffeurs background-checked?",
      answer: "Yes, absolutely. Every ShineLimos chauffeur undergoes a rigorous background check, regular drug testing, and extensive defensive driving training before ever getting behind the wheel."
    },
    {
      icon: Plane,
      question: "Do you track flights for airport pickups?",
      answer: "Yes. Our dispatch team monitors all incoming flights in real time. Whether your flight arrives early or is delayed, your chauffeur will adjust their arrival time accordingly to ensure they are waiting for you."
    },
    {
      icon: Car,
      question: "Can I request a specific vehicle model?",
      answer: "While we guarantee the vehicle class you select (e.g., Luxury Sedan, Executive SUV), we cannot always guarantee a specific make or model due to maintenance and scheduling. However, we will always do our best to accommodate specific requests."
    },
    {
      icon: HelpCircle,
      question: "Are gratuity and tolls included in the price?",
      answer: "Yes. To provide a seamless experience, all of our quotes are all-inclusive. This means standard gratuity, tolls, and fuel surcharges are already factored into the final price provided to you."
    }
  ];

  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        eyebrow="Help Center"
        title={<>Frequently Asked <em className="text-white not-italic">Questions</em></>}
        subtitle="Find answers to common questions about our services, booking process, and policies."
      />

      <SectionBackground image="https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400" overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Card */}
          <Reveal>
            <div className="glass rounded-3xl p-8 border border-white/10 glow-on-hover">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-serif-lux text-white uppercase tracking-wider">Common Questions</h2>
                </div>
              </div>
              <p className="text-white/75 leading-relaxed font-light">
                If you have a question that isn't answered here, please feel free to reach out to our 24/7 concierge team. We're always here to assist you.
              </p>
            </div>
          </Reveal>

          {/* FAQs List */}
          <div className="grid gap-6 md:grid-cols-1">
            {faqs.map((faq, idx) => {
              const Icon = faq.icon;
              return (
                <Reveal key={idx} delay={idx * 80}>
                  <div className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="glass-gold w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 mt-1">
                        <h3 className="font-serif-lux text-xl text-white tracking-wide">
                          {faq.question}
                        </h3>
                        <p className="mt-3 text-sm text-white/70 leading-relaxed font-light">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </SectionBackground>
    </div>
  );
}
