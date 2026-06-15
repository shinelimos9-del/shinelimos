import { PageHero, SectionHeading, GoldButton, GlassCard, GoldDivider } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import Reveal from "../components/Reveal";
import { Award, Shield, Users, Sparkles, Clock, Heart } from "lucide-react";
import SEO from "../components/SEO";

const values = [
  { icon: Shield, title: "Discretion", body: "Every professional driver is background-checked, NDA-bound, and trained in absolute discretion." },
  { icon: Clock, title: "Punctuality", body: "Arrive 15 minutes early or it's free. Our experienced chauffeurs value your time." },
  { icon: Sparkles, title: "Impeccability", body: "Immaculate safety standards and perfectly detailed vehicles for your peace of mind." },
  { icon: Heart, title: "Hospitality", body: "From chilled water to anticipating every need, we ensure absolute customer satisfaction as your airport transfer chauffeur." },
];

const stats = [
  { n: "15+", l: "Years of Service" },
  { n: "62k", l: "Successful Transfers" },
  { n: "200+", l: "Vehicles Fleet-Wide" },
  { n: "5.0★", l: "Average Rating" },
];

const BG = {
  story: "/images/pexels-photo-8425047.webp",
  stats: "/images/pexels-photo-1545732.webp",
  values: "/images/pexels-photo-14011664.webp",
  accred: "/images/pexels-photo-5288741.webp",
};

export default function About() {
  return (
    <div className="route-fade">
      <SEO pageKey="about" />
      <PageHero
        image="/images/pexels-photo-34440729.webp"
        video="https://videos.pexels.com/video-files/8344931/8344931-uhd_3840_2160_25fps.mp4"
        eyebrow="About ShineLimos"
        title={<>Redefining <em className="text-white not-italic">Luxury Travel</em></>}
        subtitle="We are a premier luxury transportation company dedicated to unmatched service and absolute customer satisfaction."
      />

      {/* Story */}
      <SectionBackground image={BG.story} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <div className="rounded-3xl overflow-hidden aspect-4/5 glass">
              <img
                src="/images/pexels-photo-8425047.webp"
                alt="ShineLimos LLC vehicle"
                loading="lazy"
                className="w-full h-full object-cover ken-burns"
              />
            </div>
          </Reveal>
          <Reveal variant="right">
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title={<>Built by Washington, <span className="text-white">for Washington.</span></>}
            />
            <div className="mt-8 space-y-5 text-white/70 leading-relaxed">
              <p>
                Founded on strict safety standards and a commitment to excellence, our experienced team provides exceptional service.
              </p>
              <p>
                Our experienced chauffeurs and professional drivers undergo rigorous training to ensure your peace of mind. We have grown to become the premier luxury transportation company across DC, Northern Virginia, and Maryland.
              </p>
              <p>
                We move quietly. We move correctly. And we prioritize your complete customer satisfaction.
              </p>
            </div>
            <div className="mt-8">
              <GoldButton to="/contact">Speak With Our Concierge</GoldButton>
            </div>
          </Reveal>
        </div>
      </SectionBackground>

      <GoldDivider />

      {/* Stats */}
      <SectionBackground image={BG.stats} overlay="dark" parallax className="py-20 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={s.l} variant="3d" delay={i * 100}>
              <div className="glass-dark rounded-2xl p-8 text-center">
                <div className="font-serif-lux text-5xl md:text-6xl text-white">{s.n}</div>
                <div className="text-[10px] tracking-[0.3em] text-white/55 uppercase mt-2">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionBackground>

      {/* Values */}
      <SectionBackground image={BG.values} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              eyebrow="Core Values"
              title={<>The cornerstones of our <em className="text-white not-italic">luxury transportation company</em></>}
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} variant="3d" delay={i * 100}>
                <GlassCard>
                  <div className="glass-gold w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-serif-lux text-xl text-white">{title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{body}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* Accreditation */}
      <SectionBackground image={BG.accred} overlay="dark" parallax className="py-20 px-6">
        <Reveal variant="3d">
          <div className="mx-auto max-w-6xl glass-dark rounded-3xl p-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="flex items-center gap-5">
              <Award className="h-16 w-16 text-white" />
              <div>
                <div className="text-[10px] tracking-[0.3em] text-white uppercase">Certified & Accredited</div>
                <h3 className="font-serif-lux text-2xl text-white mt-1">Trusted by every standard</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/65">
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-white" />NLA Member</div>
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-white" />WMATC Licensed</div>
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-white" />$5M Liability Insured</div>
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-white" />DOT Approved</div>
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-white" />TSA-Cleared Drivers</div>
              <div className="flex items-center gap-2"><Users className="h-3 w-3 text-white" />24/7 Live Dispatch</div>
            </div>
          </div>
        </Reveal>
      </SectionBackground>
    </div>
  );
}
