import { PageHero } from "../components/ui";
import Reveal from "../components/Reveal";
import SectionBackground from "../components/SectionBackground";
import { HelpCircle, Clock, ShieldCheck, Plane, Car, CreditCard, Briefcase, Users, Star, Heart, MapPin } from "lucide-react";
import SEO from "../components/SEO";

export default function Faq() {
  const faqs = [
    {
      icon: HelpCircle,
      question: "How do I book a limousine service with Shine Limos?",
      answer: "Booking with Shine Limos is simple and convenient. You can request a quote online, call our team directly, or submit a reservation request through our booking form. Our staff will confirm your trip details, vehicle selection, pickup location, and schedule to ensure a smooth experience from start to finish."
    },
    {
      icon: Clock,
      question: "How far in advance should I book my reservation?",
      answer: "We recommend booking as early as possible, especially for weddings, corporate events, airport transportation, and special occasions. While advance reservations provide the best vehicle availability, we also accommodate last-minute bookings whenever possible."
    },
    {
      icon: HelpCircle,
      question: "Can I make changes to my reservation after booking?",
      answer: "Yes. If your plans change, our team will do its best to accommodate modifications such as pickup times, destinations, or vehicle upgrades based on availability. Contact us as soon as possible to request any changes."
    },
    {
      icon: CreditCard,
      question: "How is the cost of limousine service determined?",
      answer: "Pricing is based on several factors, including the vehicle selected, travel distance, trip duration, pickup location, and any special requests. We provide transparent quotes with no hidden surprises."
    },
    {
      icon: ShieldCheck,
      question: "Are there any hidden fees?",
      answer: "No. Shine Limos believes in transparent pricing. Your quote includes all applicable charges discussed during booking so you can plan your transportation budget confidently."
    },
    {
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards and other commonly used payment methods. Our reservation specialists can provide details regarding accepted payment options during the booking process."
    },
    {
      icon: Plane,
      question: "Do you provide airport transportation services?",
      answer: "Yes. We offer reliable airport transportation for business travelers, families, tourists, and executives. Our airport services are designed to provide timely pickups, comfortable travel, and stress-free transfers."
    },
    {
      icon: Clock,
      question: "Do you track flight arrivals and delays?",
      answer: "Yes. Our team monitors flight schedules whenever flight information is provided. This allows us to adjust pickup times when delays or early arrivals occur."
    },
    {
      icon: Plane,
      question: "What happens if my flight is delayed?",
      answer: "If your flight is delayed, our dispatch team will adjust accordingly based on updated flight information. Our goal is to ensure your chauffeur is prepared when you arrive."
    },
    {
      icon: Briefcase,
      question: "Do you provide corporate transportation services?",
      answer: "Absolutely. Shine Limos specializes in executive transportation, corporate travel, client pickups, conferences, meetings, roadshows, and other professional transportation needs."
    },
    {
      icon: Users,
      question: "Can businesses establish corporate accounts?",
      answer: "Yes. Corporate accounts provide a streamlined booking experience, simplified billing, and dependable transportation solutions for organizations that require regular travel services."
    },
    {
      icon: Star,
      question: "Why do businesses choose Shine Limos?",
      answer: "Businesses choose us because of our professional chauffeurs, luxury fleet, punctual service, and commitment to providing a first-class experience for executives and clients."
    },
    {
      icon: Heart,
      question: "Do you offer wedding limousine services?",
      answer: "Yes. We provide elegant wedding transportation solutions for couples, bridal parties, family members, and guests. Our luxury vehicles help create a memorable arrival and departure experience."
    },
    {
      icon: Clock,
      question: "How early should wedding transportation be reserved?",
      answer: "Wedding transportation should ideally be booked several months in advance, especially during peak wedding seasons. Early reservations help ensure your preferred vehicle is available."
    },
    {
      icon: Users,
      question: "Can transportation be arranged for wedding guests?",
      answer: "Yes. We can coordinate transportation for wedding guests, family members, and bridal parties to help everyone arrive comfortably and on schedule."
    },
    {
      icon: Car,
      question: "What types of vehicles are available in your fleet?",
      answer: "Our fleet includes luxury sedans, executive SUVs, stretch limousines, Mercedes Sprinter vans, and other premium transportation options designed for both individual and group travel."
    },
    {
      icon: Car,
      question: "Can I request a specific vehicle?",
      answer: "Yes. We encourage clients to choose the vehicle that best fits their transportation needs. Availability depends on the reservation date and schedule."
    },
    {
      icon: ShieldCheck,
      question: "Are your vehicles professionally maintained?",
      answer: "Absolutely. Every vehicle in our fleet undergoes routine inspections and maintenance to ensure safety, reliability, cleanliness, and passenger comfort."
    },
    {
      icon: Star,
      question: "Are your chauffeurs professionally trained?",
      answer: "Yes. Our chauffeurs are experienced professionals who are trained to provide safe, courteous, and dependable transportation services."
    },
    {
      icon: ShieldCheck,
      question: "Are your chauffeurs licensed and insured?",
      answer: "Yes. All chauffeurs meet applicable licensing requirements and operate under proper insurance coverage to provide peace of mind for our clients."
    },
    {
      icon: ShieldCheck,
      question: "How does Shine Limos prioritize passenger safety?",
      answer: "Safety is a top priority. We maintain our vehicles regularly, follow strict operational standards, and employ professional chauffeurs who focus on safe and responsible driving practices."
    },
    {
      icon: MapPin,
      question: "What areas do you serve?",
      answer: "Shine Limos proudly serves Washington DC, Northern Virginia, Maryland, and surrounding regions with luxury transportation solutions for both personal and business travel."
    },
    {
      icon: MapPin,
      question: "Do you offer transportation outside the local area?",
      answer: "Yes. We can accommodate long-distance transportation requests depending on the destination and scheduling requirements."
    },
    {
      icon: MapPin,
      question: "Can I book transportation between cities or states?",
      answer: "Yes. We provide point-to-point transportation services for clients traveling between cities, airports, hotels, business centers, and special event destinations."
    },
    {
      icon: Star,
      question: "Do you provide transportation for special events?",
      answer: "Yes. We offer luxury transportation for birthdays, anniversaries, concerts, sporting events, proms, galas, and many other special occasions."
    },
    {
      icon: Users,
      question: "Do you offer group transportation services?",
      answer: "Yes. Our larger vehicles, including Sprinter vans and group transportation options, are ideal for corporate groups, wedding parties, family gatherings, and event transportation."
    },
    {
      icon: Star,
      question: "What makes Shine Limos different from other transportation providers?",
      answer: "Shine Limos combines luxury vehicles, professional chauffeurs, personalized customer service, transparent pricing, and a commitment to reliability. Our goal is to provide every client with a comfortable, stress-free, and first-class transportation experience."
    }
  ];

  return (
    <div className="route-fade">
      <SEO pageKey="faq" />
      <PageHero
        image="/images/pexels-photo-5288741.webp"
        eyebrow="Help Center"
        title={<>Transportation Support & <em className="text-white not-italic">FAQ</em></>}
        subtitle="Find answers to common questions about our luxury limo service, booking process, and transportation solutions."
      />

      <SectionBackground image="/images/pexels-photo-14011664.webp" overlay="dark" parallax className="py-20 px-6">
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
