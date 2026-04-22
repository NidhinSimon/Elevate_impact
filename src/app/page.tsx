import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  Heart,
  ChevronRight,
  Star,
  Users,
  Globe,
  Zap,
} from "lucide-react";

const stats = [
  { value: "14,289", label: "Active Members", icon: Users },
  { value: "$845K", label: "Total Donated", icon: Heart },
  { value: "42", label: "Charity Partners", icon: Globe },
  { value: "$124K", label: "Current Prize Pool", icon: Trophy },
];

const howItWorks = [
  {
    step: "01",
    icon: TrendingUp,
    title: "Log Performance",
    desc: "Upload your verified athletic scores. Every confirmed entry acts as your ticket into the global reward ecosystem.",
    color: "#c3c0ff",
    bg: "#1a146b",
  },
  {
    step: "02",
    icon: Trophy,
    title: "Enter the Draw",
    desc: "Accumulate entries to unlock tiers in our monthly high-stakes prize draws, featuring premium equipment and experiences.",
    color: "#68dba9",
    bg: "#00432d",
  },
  {
    step: "03",
    icon: Heart,
    title: "Generate Impact",
    desc: "A significant percentage of every subscription directly funds vetted global charities. Your play translates to tangible change.",
    color: "#c3c0ff",
    bg: "#1a146b",
  },
];

const charities = [
  {
    name: "Global Education Fund",
    raised: "$1.2M",
    impact: "+24%",
    desc: "Empowering the next generation through education.",
    emoji: "📚",
  },
  {
    name: "Blue Horizon Initiative",
    raised: "$850K",
    impact: "+12%",
    desc: "Ocean conservation and marine ecosystem protection.",
    emoji: "🌊",
  },
  {
    name: "Vitality Health Foundation",
    raised: "$2.4M",
    impact: "+31%",
    desc: "Breakthrough medical research for underserved communities.",
    emoji: "💚",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Elite Member · Tier 3",
    quote:
      "I've won twice this year and my contributions have helped plant 2,000 trees. This platform completely changed how I think about sport.",
    stars: 5,
  },
  {
    name: "Marcus Reeves",
    role: "Premium Member · Tier 2",
    quote:
      "The transparency is what sold me. I can see exactly where my subscription goes — it's the most meaningful thing I do each month.",
    stars: 5,
  },
  {
    name: "Priya Malhotra",
    role: "Founding Member · Tier 3",
    quote:
      "I play golf anyway — why not have it fund clean water projects globally? The draw winnings are a bonus. The impact is the point.",
    stars: 5,
  },
];

export default function HomePage() {
  return (
    <div style={{ background: "#faf8ff", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden min-h-[800px] flex items-center"
        style={{
          background: "linear-gradient(180deg, #130f4a 0%, #1a146b 100%)",
          paddingTop: "100px",
          paddingBottom: "100px",
        }}
      >
        {/* Background decorations */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Decorative circle behind card */}
          <div 
            className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 opacity-20"
            style={{ 
              background: "radial-gradient(circle, rgba(195,192,255,0.05) 0%, transparent 70%)"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1
                className="font-extrabold leading-[1.1] mb-8"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                }}
              >
                Play. Win.
                <br />
                <span style={{ color: "#68dba9" }}>Give Back.</span>
              </h1>

              <p
                className="text-xl leading-relaxed mb-10 max-w-lg"
                style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}
              >
                The premium subscription platform where your athletic performance
                unlocks exclusive rewards and funds global social impact
                initiatives.
              </p>

              <div className="flex flex-wrap gap-5">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-[0_0_40px_rgba(104,219,169,0.2)]"
                  style={{
                    background: "#68dba9",
                    color: "#002b1b",
                  }}
                >
                  Subscribe Now
                </Link>
                <Link
                  href="/charity"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white/10"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  Explore the Mission
                </Link>
              </div>
            </div>

            {/* Hero card */}
            <div className="flex justify-center lg:justify-end relative">
              <div
                className="relative w-full max-w-md rounded-[40px] p-10 float shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(30px)",
                }}
              >
                {/* Icon */}
                <div className="absolute top-10 right-10">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(104,219,169,0.1)", color: "#68dba9" }}
                  >
                    <Trophy size={24} />
                  </div>
                </div>

                <p
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  MONTHLY DRAW POOL
                </p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span 
                    className="font-extrabold"
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "4.5rem",
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                      lineHeight: 1
                    }}
                  >
                    $124,500
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-10">
                  <TrendingUp size={16} style={{ color: "#68dba9" }} />
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <span style={{ color: "#68dba9" }}>+14.2%</span> from last month
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-4">
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="h-full rounded-full relative"
                      style={{
                        width: "80%",
                        background: "#68dba9",
                        boxShadow: "0 0 20px rgba(104,219,169,0.4)"
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Current Phase</span>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Draw in 4 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-6 rounded-2xl group hover:scale-105 transition-transform duration-300"
                style={{ background: "#f2f3ff" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "#e2dfff" }}
                >
                  <Icon size={22} style={{ color: "#1a146b" }} />
                </div>
                <p
                  className="font-extrabold text-2xl mb-1"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    color: "#1a146b",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {value}
                </p>
                <p className="text-sm" style={{ color: "#474651" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#faf8ff", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="max-w-2xl mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#312e81" }}
            >
              The Process
            </p>
            <h2
              className="font-extrabold leading-tight mb-4"
              style={{
                fontFamily: "Manrope, sans-serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#131b2e",
                letterSpacing: "-0.02em",
              }}
            >
              Engineered for Performance.
              <br />
              <span style={{ color: "#312e81" }}>Built for Impact.</span>
            </h2>
            <p className="text-base" style={{ color: "#474651" }}>
              Three steps that transform your athletic journey into a force for
              global good.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl p-8 group hover:-translate-y-2 transition-transform duration-300"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 4px 24px rgba(26,20,107,0.06)",
                }}
              >
                {/* Step number */}
                <div
                  className="absolute top-6 right-6 text-5xl font-black opacity-10"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    color: "#1a146b",
                  }}
                >
                  {item.step}
                </div>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: item.bg }}
                >
                  <item.icon size={26} style={{ color: item.color }} />
                </div>

                <h3
                  className="font-bold text-xl mb-3"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    color: "#131b2e",
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#474651" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITIES ── */}
      <section style={{ background: "#eaedff", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#312e81" }}
              >
                Impact Partners
              </p>
              <h2
                className="font-extrabold leading-tight"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  color: "#131b2e",
                  letterSpacing: "-0.02em",
                }}
              >
                Your Play, Their Future.
              </h2>
            </div>
            <Link
              href="/charity"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
              style={{ color: "#312e81" }}
            >
              View all partners <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((c) => (
              <div
                key={c.name}
                className="rounded-3xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 4px 20px rgba(26,20,107,0.06)",
                }}
              >
                {/* Card header */}
                <div
                  className="p-6"
                  style={{ background: "linear-gradient(135deg, #1a146b 0%, #312e81 100%)" }}
                >
                  <div className="text-4xl mb-3">{c.emoji}</div>
                  <h3
                    className="font-bold text-lg text-white mb-1"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {c.name}
                  </h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {c.desc}
                  </p>
                </div>

                {/* Card footer */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ background: "#dae2fd" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "#474651" }}>
                      Total Raised
                    </p>
                    <p
                      className="font-bold text-lg"
                      style={{ fontFamily: "Manrope, sans-serif", color: "#1a146b" }}
                    >
                      {c.raised}
                    </p>
                  </div>
                  <div
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "#002b1b", color: "#68dba9" }}
                  >
                    <TrendingUp size={11} />
                    {c.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: "#ffffff", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#312e81" }}
            >
              Community Voices
            </p>
            <h2
              className="font-extrabold"
              style={{
                fontFamily: "Manrope, sans-serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                color: "#131b2e",
                letterSpacing: "-0.02em",
              }}
            >
              Members Driving Change
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl p-7 flex flex-col hover:-translate-y-1 transition-transform duration-300"
                style={{
                  background: "#f2f3ff",
                  boxShadow: "0 2px 12px rgba(26,20,107,0.04)",
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#c3c0ff"
                      style={{ color: "#c3c0ff" }}
                    />
                  ))}
                </div>

                <p
                  className="text-sm leading-relaxed flex-1 mb-6 italic"
                  style={{ color: "#474651" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "#1a146b", color: "#c3c0ff" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#131b2e" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: "#777682" }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "96px 24px" }}>
        <div
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #1a146b 0%, #312e81 100%)",
            boxShadow: "0 24px 80px rgba(26,20,107,0.35)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15"
            style={{ background: "#68dba9" }}
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10"
            style={{ background: "#c3c0ff" }}
            aria-hidden
          />

          <div className="relative px-12 py-16 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#c3c0ff" }}
            >
              Ready to Elevate?
            </p>
            <h2
              className="font-extrabold text-white mb-4"
              style={{
                fontFamily: "Manrope, sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Turn Every Round Into
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #68dba9 0%, #85f8c4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Real-World Impact
              </span>
            </h2>
            <p
              className="text-base mb-8 max-w-lg mx-auto"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Join 14,000+ members who are playing with purpose. Start your
              journey today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #68dba9, #85f8c4)",
                  color: "#002b1b",
                  boxShadow: "0 8px 24px rgba(104,219,169,0.4)",
                }}
              >
                Choose Your Plan <ArrowRight size={16} />
              </Link>
              <Link
                href="/charity"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff",
                }}
              >
                Explore Charities
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
