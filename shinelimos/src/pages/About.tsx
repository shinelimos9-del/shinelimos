import { PageHero, SectionHeading, GoldButton, GlassCard, GoldDivider } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import Reveal from "../components/Reveal";
import { Award, Shield, Users, Sparkles, Clock, Heart } from "lucide-react";

const values = [
  { icon: Shield, title: "Discretion", body: "Every chauffeur is background-checked, NDA-bound and trained in the art of becoming invisible." },
  { icon: Clock, title: "Punctuality", body: "Arrive 15 minutes early or it's free. A standard we've held for 15+ years." },
  { icon: Sparkles, title: "Impeccability", body: "Every vehicle is hand-detailed before every reservation. No exceptions." },
  { icon: Heart, title: "Hospitality", body: "From the bottle of water in the cup holder to the umbrella by the door — every detail anticipated." },
];

const stats = [
  { n: "15+", l: "Years of Service" },
  { n: "62k", l: "Successful Transfers" },
  { n: "200+", l: "Vehicles Fleet-Wide" },
  { n: "5.0★", l: "Average Rating" },
];

const BG = {
  story: "https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  stats: "https://images.pexels.com/photos/1545732/pexels-photo-1545732.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  values: "https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
  accred: "https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400",
};

export default function About() {
  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/34440729/pexels-photo-34440729.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        video="https://videos.pexels.com/video-files/8344931/8344931-uhd_3840_2160_25fps.mp4"
        eyebrow="About ShineLimos"
        title={<>A Quiet Standard of <em className="text-white not-italic">Excellence</em></>}
        subtitle="Founded in 2010 by a former diplomatic transportation manager, ShineLimos LLC was built on a single conviction: Washington deserved better."
      />

      {/* Story */}
      <SectionBackground image={BG.story} overlay="dark" parallax className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <div className="rounded-3xl overflow-hidden aspect-4/5 glass">
              <img
                src="https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900"
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
                ShineLimos LLC was born inside the marble corridors of the State Department, where our
                founder spent twelve years coordinating motorcades for visiting heads of state. He left
                with one frustration: the city's private car services simply weren't meeting the standard
                of the city itself.
              </p>
              <p>
                In 2010, we launched with three Mercedes S-Classes and a single rule — arrive fifteen
                minutes early or refund the ride. Fifteen years later, that rule still stands. Today,
                we operate a fleet of more than two hundred vehicles across DC, Northern Virginia and
                Maryland, but our soul has never changed.
              </p>
              <p>
                We move quietly. We move correctly. And we move on time.
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
              title={<>The four pillars of <em className="text-white not-italic">our craft</em></>}
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
