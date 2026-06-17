"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteChat from "@/components/SiteChat";
import { PixelIcon } from "@/components/PixelIcon";
import { useLang } from "@/lib/i18n";

/* ─── motion (snappy, stepped) ─── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      {children}
    </motion.div>
  );
}

/* ─── window primitive ─── */
function Win({ title, icon, children, className = "" }: { title: string; icon?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`win ${className}`}>
      <div className="win-title">
        <span className="flex items-center gap-1.5">
          {icon && <PixelIcon name={icon} size={12} />}
          {title}
        </span>
        <span className="flex items-center gap-1">
          <span className="win-btn">_</span>
          <span className="win-btn">o</span>
          <span className="win-btn">x</span>
        </span>
      </div>
      {children}
    </div>
  );
}

/* floating pink pixel badge (like the icon showcase) */
function Badge({ icon, className = "", rot = 0 }: { icon: string; className?: string; rot?: number }) {
  return (
    <div className={`absolute hidden md:grid place-items-center w-16 h-16 border-2 border-[var(--border)] ${className}`}
      style={{ background: "var(--accent)", transform: `rotate(${rot}deg)`, boxShadow: "4px 4px 0 0 var(--border)" }}>
      <PixelIcon name={icon} size={34} className="text-[#1b1b1b]" />
    </div>
  );
}

const SECTION = "px-5 md:px-6 py-20 md:py-28";

export default function Home() {
  const { t } = useLang();
  return (
    <div className="os-desktop min-h-screen text-[var(--text)] overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-5 pt-24">
        <Badge icon="robot-face-happy" className="left-[8%] top-[24%]" rot={-8} />
        <Badge icon="sunglasses" className="right-[10%] top-[20%]" rot={9} />
        <Badge icon="thumbs-up" className="left-[14%] bottom-[14%]" rot={6} />
        <Badge icon="sparkle" className="right-[12%] bottom-[18%]" rot={-10} />

        <motion.div initial="hidden" animate="show" variants={stagger} className="relative w-full max-w-3xl">
          <Win title="AIFOREVERYONE.SYS" icon="computer" className="text-left">
            <div className="p-7 md:p-11 text-center">
              <motion.p variants={fadeUp} className="inline-flex items-center gap-2 px-2.5 py-1 mb-7 border-2 border-[var(--border)] text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 bg-[var(--accent)] pulse-dot" /> {t.hero.badge}
              </motion.p>
              <motion.h1 variants={fadeUp} className="font-display leading-[1.5] text-[clamp(1.05rem,4.4vw,2.4rem)]">
                {t.hero.titleA}<br />
                <span className="text-[var(--accent)]">{t.hero.titleB}</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-7 text-xl md:text-2xl text-[var(--text-muted)] leading-snug max-w-xl mx-auto">
                {t.hero.subtitle}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/onboarding" className="pbtn pbtn-primary">
                  <PixelIcon name="zap" size={14} /> {t.hero.ctaPrimary}
                </Link>
                <Link href="/dashboard" className="pbtn">
                  <PixelIcon name="play" size={14} /> {t.hero.ctaSecondary}
                </Link>
              </motion.div>
            </div>
          </Win>
          <motion.p variants={fadeUp} className="mt-5 text-base text-[var(--text-muted)] blink-cursor">
            <span className="text-[var(--accent)]">{">"}</span> {t.hero.ready}<span className="blink">_</span>
          </motion.p>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section className={SECTION}>
        <Reveal className="mx-auto max-w-5xl">
          <Win title="STATS.DAT" icon="chart">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-y-2 md:divide-y-0 divide-[var(--border)]">
              {t.stats.map((s) => (
                <div key={s.l} className="px-5 py-9 text-center">
                  <div className="font-display text-[clamp(1rem,3vw,1.6rem)] text-[var(--accent)]">{s.v}</div>
                  <div className="text-base text-[var(--text-muted)] mt-3 leading-snug uppercase tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>
          </Win>
        </Reveal>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className={`${SECTION} scroll-mt-20`}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 md:mb-14">
            <h2 className="font-display text-[clamp(0.95rem,3vw,1.7rem)] leading-relaxed">{t.features.heading}</h2>
            <p className="mt-4 text-xl text-[var(--text-muted)]">{t.features.sub}</p>
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {t.features.items.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="win flex flex-col">
                <div className="win-title"><span className="truncate">{f.title.toUpperCase()}.EXE</span><span className="win-btn">x</span></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="w-12 h-12 grid place-items-center mb-4 border-2 border-[var(--border)]" style={{ background: "var(--accent)" }}>
                    <PixelIcon name={f.icon} size={26} className="text-[#1b1b1b]" />
                  </div>
                  <h3 className="font-display text-[11px] leading-relaxed mb-3">{f.title}</h3>
                  <p className="text-lg text-[var(--text-muted)] leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW (install log) ─── */}
      <section id="how" className={`${SECTION} scroll-mt-20`}>
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-8">
            <h2 className="font-display text-[clamp(0.95rem,3vw,1.7rem)] leading-relaxed">{t.how.heading}</h2>
          </Reveal>
          <Reveal>
            <Win title="INSTALL.LOG" icon="terminal">
              <div className="p-5 md:p-7 space-y-5">
                {t.how.steps.map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <span className="font-display text-[var(--accent)] text-[11px] shrink-0 mt-1">{s.n}</span>
                    <div>
                      <p className="font-display text-[11px] mb-1.5">{s.title}</p>
                      <p className="text-lg text-[var(--text-muted)] leading-snug">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <p className="text-lg text-[var(--accent)] pt-1">{">"} {t.how.done}<span className="blink">_</span></p>
              </div>
            </Win>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className={`${SECTION} scroll-mt-20`}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 md:mb-14">
            <h2 className="font-display text-[clamp(0.95rem,3vw,1.7rem)] leading-relaxed">{t.pricing.heading}</h2>
            <p className="mt-4 text-xl text-[var(--text-muted)]">{t.pricing.sub}</p>
          </Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {t.pricing.plans.map((p) => (
              <motion.div key={p.name} variants={fadeUp}
                className={`win flex flex-col ${p.highlight ? "ring-2 ring-[var(--accent)]" : ""}`}>
                <div className="win-title" style={p.highlight ? { background: "var(--accent)", color: "#1b1b1b" } : undefined}>
                  <span>{p.name.toUpperCase()}</span>
                  {p.highlight && <span className="text-[8px]">{t.pricing.popular}</span>}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6 flex items-baseline gap-1.5 min-h-[2.75rem]">
                    <span className="font-display text-[clamp(0.95rem,2.6vw,1.35rem)] text-[var(--accent)]">{p.price}</span>
                    {p.price !== t.pricing.custom && <span className="text-[var(--text-muted)] text-base">{t.pricing.perMonth}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-lg leading-snug">
                        <PixelIcon name="check" size={16} className="text-[var(--accent)] mt-1 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/onboarding" className={`pbtn w-full ${p.highlight ? "pbtn-primary" : ""}`}>{p.cta}</Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={`${SECTION} pb-28`}>
        <Reveal className="mx-auto max-w-4xl">
          <Win title="START.BAT" icon="zap">
            <div className="p-8 md:p-16 text-center relative scanlines">
              <h2 className="font-display text-[clamp(1rem,3.4vw,2rem)] leading-[1.5]">
                {t.cta.headingA}<br /><span className="text-[var(--accent)]">{t.cta.headingB}</span>
              </h2>
              <p className="mt-6 text-xl text-[var(--text-muted)] max-w-xl mx-auto leading-snug">
                {t.cta.sub}
              </p>
              <Link href="/onboarding" className="pbtn pbtn-primary mt-9 mx-auto">
                <PixelIcon name="zap" size={14} /> {t.cta.button}
              </Link>
            </div>
          </Win>
        </Reveal>
      </section>

      <Footer />
      <SiteChat />
    </div>
  );
}
