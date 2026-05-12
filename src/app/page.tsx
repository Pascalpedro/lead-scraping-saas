import React from 'react';
import Link from 'next/link';
import s from './Landing.module.css';

const FEATURES = [
  {
    title: 'Unmatched Data Breadth',
    desc:  'Tap into a verified pool of B2B contacts across every industry, seniority level, and geography.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    title: 'High-Quality Database',
    desc:  'Continuously refreshed, high-accuracy data so you always reach the right decision-makers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    title: 'Superior Enrichment',
    desc:  'Enrich every lead with headline, industry, company, and location using our AI-driven pipelines.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    title: 'Unbelievably Simple',
    desc:  'Type a job title or industry. RMKR handles everything — search, enrichment, and personalisation.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'AI-Powered Personalisation',
    desc:  'Generate a unique, high-converting icebreaker for every single lead using Claude or Gemini.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    title: 'Verify With Precision',
    desc:  'Dual-layer email verification via AnyMailFinder and Prospeo keeps bounce rates near zero.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    quote: '"It delivers exactly what it promises. Type a role, get a verified list with personalised lines — nothing else comes close for outbound."',
    name: 'James A.',
    role: 'Head of Sales, Northfield Capital',
    initial: 'J',
  },
  {
    quote: '"RMKR replaced three separate tools in our stack. The AI icebreakers alone have lifted our reply rates by over 30%."',
    name: 'Priya M.',
    role: 'Founder, Oriel Growth',
    initial: 'P',
  },
  {
    quote: '"The setup took minutes. We went from zero to a fully enriched list of 500 leads in under 10 minutes. Genuinely impressive."',
    name: 'Daniel R.',
    role: 'Co-Founder, Stackflow Labs',
    initial: 'D',
  },
];

function CheckIcon() {
  return (
    <svg className={s.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

import { PuzzleLogo } from '@/components/PuzzleLogo';

export default function LandingPage() {
  return (
    <div className={s.page}>

      {/* ── Navbar ── */}
      <nav className={s.nav}>
        <div className={s.logo}>
          <div className={s.logoMark}>
            <PuzzleLogo className={s.puzzleIcon} />
          </div>
          RMKR
        </div>
        <div className={s.navLinks}>
          <Link href="#features">Product</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#how-it-works">Resources</Link>
        </div>
        <div className={s.navRight}>
          <Link href="/login"  className={s.navLogin}>Log in</Link>
          <Link href="/signup" className={s.navCta}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroBadge}>✦ Trusted by B2B sales teams worldwide</div>
        <h1 className={s.heroTitle}>
          Everything You Need to Build<br />
          an <em>Outbound Cold Email List</em>
        </h1>
        <p className={s.heroSubtitle}>
          RMKR is your modern engine to source, verify, and personalise business
          emails — specifically designed for high-converting outbound campaigns.
        </p>
        <div className={s.heroCtas}>
          <Link href="/signup" className={s.ctaPrimary}>Start →</Link>
          <Link href="#how-it-works" className={s.ctaSecondary}>See how it works</Link>
        </div>
        <p className={s.heroNote}>No credit card required. Free credits upon sign up.</p>
      </section>

      {/* ── Features ── */}
      <section className={s.featuresSection} id="features">
        <div className={s.sectionInner}>
          <div className={s.sectionCenter}>
            <h2 className={s.sectionTitle}>Built for Performance</h2>
            <p className={s.sectionSub}>A complete suite for end-to-end modern B2B prospecting.</p>
          </div>
          <div className={s.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={s.featureCard}>
                <div className={s.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Personalisation ── */}
      <section className={s.aiSection} id="how-it-works">
        <div className={s.sectionInner}>
          <div className={s.aiGrid}>
            <div>
              <div className={s.sectionEyebrow}>✦ AI Personalisation</div>
              <h2 className={s.sectionTitle}>See the Full Picture Behind Every Lead</h2>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.95rem', lineHeight: 1.65 }}>
                RMKR's AI layer brings more intelligence to your data — revealing each lead's
                role and seniority, and generating hyper-personalised icebreakers for your cold outreach.
              </p>
              <div className={s.aiBullets}>
                <div className={s.aiBullet}>Custom LLM-based icebreaker generation</div>
                <div className={s.aiBullet}>Role &amp; seniority classification</div>
                <div className={s.aiBullet}>Anthropic Claude · Gemini fallback</div>
              </div>
            </div>
            <div className={s.aiCard}>
              <div className={s.aiCardLabel}>
                AI Personalisation Prompt
                <span className={s.aiDot} />
              </div>
              <div className={s.aiPrompt}>
                "Generate a one-line icebreaker mentioning the lead's role at{' '}
                <span>{'{{organisation_name}}'}</span> and their title as{' '}
                <span>{'{{headline}}'}</span>."
              </div>
              <div className={s.aiOutput}>
                Output: "Hey Sarah. Love what you're building at Northfield — also in fintech.
                Wanted to run something by you."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={s.statsSection}>
        <div className={s.statsGrid}>
          {[
            { num: '200M+', label: 'B2B contacts indexed' },
            { num: '92%',   label: 'Average email accuracy' },
            { num: '50M+',  label: 'Emails verified to date' },
            { num: '20M+',  label: 'Company profiles' },
          ].map(st => (
            <div key={st.label} className={s.statItem}>
              <div className={s.statNum}>{st.num}</div>
              <div className={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={s.pricingSection} id="pricing">
        <div className={s.sectionInner}>
          <div className={s.sectionCenter}>
            <h2 className={s.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={s.sectionSub}>
              Pay for what you use. 1 credit = 1 verified &amp; enriched lead. Volume discounts applied automatically.
            </p>
          </div>
          <div className={s.pricingGrid}>
            {/* Starter */}
            <div className={s.pricingCard}>
              <p className={s.pricingTier}>Starter</p>
              <p className={s.pricingPrice}>$49<span>/mo</span></p>
              <p className={s.pricingDesc}>Perfect for individuals starting their outbound journey.</p>
              <hr className={s.divider} />
              <ul className={s.pricingFeatures}>
                {['1,000 Credits','AI Icebreaker Generation','Real-time Email Verification','CSV Export'].map(f => (
                  <li key={f}><CheckIcon />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className={s.pricingBtn}>Get Started</Link>
            </div>
            {/* Growth — featured */}
            <div className={`${s.pricingCard} ${s.featured}`}>
              <span className={s.featuredBadge}>Most Popular</span>
              <p className={s.pricingTier}>Growth</p>
              <p className={s.pricingPrice}>$99<span>/mo</span></p>
              <p className={s.pricingDesc}>For growing teams running scaled outbound plays.</p>
              <hr className={s.divider} />
              <ul className={s.pricingFeatures}>
                {['2,500 Credits','Custom AI Prompt Engineering','Dual Email Enrichment (AnyMailFinder + Prospeo)','Priority Processing','Order History & Re-export'].map(f => (
                  <li key={f}><CheckIcon />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className={`${s.pricingBtn} ${s.pricingBtnFeatured}`}>Get Started</Link>
            </div>
            {/* Scale */}
            <div className={s.pricingCard}>
              <p className={s.pricingTier}>Scale</p>
              <p className={s.pricingPrice}>$249<span>/mo</span></p>
              <p className={s.pricingDesc}>For agencies and high-volume data operations.</p>
              <hr className={s.divider} />
              <ul className={s.pricingFeatures}>
                {['10,000 Credits','Bring Your Own API Keys','Unlimited Workspaces','Dedicated Support','Custom Deliverability Setup'].map(f => (
                  <li key={f}><CheckIcon />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className={s.pricingBtn}>Get Started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={s.testimonialsSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionCenter}>
            <h2 className={s.sectionTitle}>What our customers say</h2>
          </div>
          <div className={s.testimonialsGrid}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className={s.testimonialCard}>
                <p className={s.testimonialQuote}>{t.quote}</p>
                <div className={s.testimonialAuthor}>
                  <div className={s.testimonialAvatar}>{t.initial}</div>
                  <div>
                    <p className={s.testimonialName}>{t.name}</p>
                    <p className={s.testimonialRole}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={s.ctaBanner}>
        <div className={s.ctaBannerInner}>
          <h2>Get started today.</h2>
          <p>Find professional emails and key company data in a matter of seconds.</p>
          <Link href="/signup" className={s.ctaPrimary} style={{ display: 'inline-flex' }}>
            Start →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div>
            <div className={s.footerLogo}>
              <div className={s.logoMark}>
                <PuzzleLogo className={s.puzzleIcon} />
              </div>
              RMKR
            </div>
            <p className={s.footerTagline}>Your B2B Lead Generation Solution.</p>
          </div>
          <div className={s.footerLinks}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Contact Us</Link>
          </div>
        </div>
        <p className={s.footerCopy}>Copyright © 2026 by RMKR. All rights reserved.</p>
      </footer>

    </div>
  );
}
