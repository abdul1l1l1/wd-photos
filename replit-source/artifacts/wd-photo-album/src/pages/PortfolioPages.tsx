import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Dumbbell,
  Gamepad2,
  Mail,
  Mountain,
  Music2,
  Wrench,
} from 'lucide-react';
import './PortfolioPages.css';

type PortfolioPage = 'home' | 'media' | 'future' | 'interests' | 'goals';

const navigation: { id: PortfolioPage; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'media', label: 'Media', href: '/media' },
  { id: 'future', label: 'Future Plan', href: '/future' },
  { id: 'interests', label: 'Interests', href: '/interests' },
  { id: 'goals', label: 'Goals', href: '/goals' },
];

export function PortfolioNav({ active }: { active: PortfolioPage }) {
  return (
    <nav className="portfolio-nav" aria-label="Portfolio pages" data-testid="nav-portfolio">
      {navigation.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`portfolio-nav-link${active === item.id ? ' is-active' : ''}`}
          aria-current={active === item.id ? 'page' : undefined}
          data-testid={`link-portfolio-${item.id}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function PortfolioHeader({ active }: { active: PortfolioPage }) {
  useEffect(() => {
    const titles: Record<PortfolioPage, string> = {
      home: 'Abdul Alawad | Student & Trades Portfolio',
      media: 'WD Photos | Abdul Alawad',
      future: 'Future Plan | Abdul Alawad',
      interests: 'Interests | Abdul Alawad',
      goals: 'Goals | Abdul Alawad',
    };
    document.title = titles[active];
  }, [active]);

  return (
    <header className={`portfolio-header${active === 'media' ? ' portfolio-media-header' : ''}`}>
      <div className="portfolio-header-inner">
        <Link href="/" className="portfolio-identity" aria-label="Abdul Alawad — Home" data-testid="link-portfolio-home-brand">
          <span className="portfolio-monogram" aria-hidden="true">AA</span>
          <span className="portfolio-identity-copy">
            <span className="portfolio-name">Abdul Alawad</span>
            <span className="portfolio-school">Grossmont High School <i aria-hidden="true">/</i> Class of 2028</span>
          </span>
        </Link>
        <PortfolioNav active={active} />
      </div>
    </header>
  );
}

function PortfolioShell({
  active,
  children,
}: {
  active: Exclude<PortfolioPage, 'media'>;
  children: ReactNode;
}) {
  return (
    <div className="portfolio-root">
      <PortfolioHeader active={active} />
      <main className="portfolio-main">{children}</main>
      <footer className="portfolio-footer">
        <p>© {new Date().getFullYear()} Abdul Alawad <span aria-hidden="true">·</span> Grossmont High School Class of 2028</p>
        <div className="portfolio-footer-links">
          <a href="https://instagram.com/abdul1l1l1" target="_blank" rel="noreferrer" data-testid="link-footer-instagram">
            Instagram <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a href="mailto:abdulalawad80@gmail.com" data-testid="link-footer-email">
            Email <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="portfolio-section-heading">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="portfolio-lede">{description}</p>
    </div>
  );
}

function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [mailtoHref, setMailtoHref] = useState('');

  const prepareEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `Portfolio message from ${name.trim()}`;
    const body = `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`;
    setMailtoHref(
      `mailto:abdulalawad80@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <section className="portfolio-contact portfolio-card" id="contact-section" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="portfolio-eyebrow">Open line</p>
        <h2 id="contact-title">Get in touch</h2>
        <p>Connect on Instagram or prepare a message in your email app.</p>
        <div className="contact-links">
          <a href="https://instagram.com/abdul1l1l1" target="_blank" rel="noreferrer" className="contact-link" data-testid="link-contact-instagram">
            <span className="contact-link-mark" aria-hidden="true">IG</span>
            <span><small>Instagram</small><strong>@abdul1l1l1</strong></span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href="mailto:abdulalawad80@gmail.com" className="contact-link" data-testid="link-contact-email">
            <span className="contact-link-mark" aria-hidden="true"><Mail size={15} /></span>
            <span><small>Direct email</small><strong>abdulalawad80@gmail.com</strong></span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <form className="portfolio-form" onSubmit={prepareEmail} data-testid="form-contact">
        <div className="form-fields-row">
          <label>
            <span>Your name</span>
            <input
              value={name}
              onChange={(event) => { setName(event.target.value); setMailtoHref(''); }}
              placeholder="Name"
              autoComplete="name"
              required
              maxLength={100}
              data-testid="input-contact-name"
            />
          </label>
          <label>
            <span>Your email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setMailtoHref(''); }}
              placeholder="you@example.com"
              autoComplete="email"
              required
              maxLength={180}
              data-testid="input-contact-email"
            />
          </label>
        </div>
        <label>
          <span>Message</span>
          <textarea
            value={message}
            onChange={(event) => { setMessage(event.target.value); setMailtoHref(''); }}
            placeholder="What would you like to talk about?"
            rows={4}
            required
            maxLength={2000}
            data-testid="input-contact-message"
          />
        </label>
        <button type="submit" className="portfolio-button" data-testid="button-prepare-email">
          Prepare email <ArrowDownRight size={15} aria-hidden="true" />
        </button>
        {mailtoHref && (
          <div className="mailto-handoff" role="status" data-testid="status-email-handoff">
            <p>Your email app will open with these details. Review the message, then press Send there; nothing is sent from this site.</p>
            <a href={mailtoHref} className="mailto-action" data-testid="link-open-email-app">
              Open email app <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        )}
      </form>
    </section>
  );
}

export function HomePage() {
  return (
    <PortfolioShell active="home">
      <section className="home-hero portfolio-card" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="portfolio-eyebrow">Student <span aria-hidden="true">·</span> Trades</p>
          <span className="portfolio-chip">Grossmont High School <span aria-hidden="true">/</span> Class of 2028</span>
          <h1 id="home-title">Abdul<br /><span>Alawad.</span></h1>
          <p className="home-summary">High school student in El Cajon, California focusing on building construction, automotive mechanics, and trade skills.</p>
          <div className="home-actions">
            <Link href="/media" className="portfolio-button portfolio-button-light" data-testid="link-view-media">
              View media portfolio <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/interests" className="portfolio-button portfolio-button-quiet" data-testid="link-explore-interests">
              Explore interests
            </Link>
          </div>
        </div>
        <figure className="profile-photo">
          <img src="https://i.imgur.com/OzBr4cB.jpeg" alt="Abdul Alawad" referrerPolicy="no-referrer" data-testid="img-profile" />
          <figcaption><span>El Cajon, California</span><span>Student / Trades</span></figcaption>
        </figure>
        <span className="hero-index" aria-hidden="true">01 — PROFILE</span>
      </section>

      <section className="bio-section" aria-labelledby="about-title">
        <div className="section-side-label"><span>01</span><span>About</span></div>
        <div className="bio-content">
          <p className="portfolio-eyebrow">A little background</p>
          <h2 id="about-title">Learning by<br />making things.</h2>
          <div className="bio-paragraphs">
            <p>My name is Abdul Alawad, and I am a high school student attending Grossmont High School in El Cajon, California, preparing for graduation with the Class of 2028.</p>
            <p>I am interested in practical trade work including structural building, HVAC system mechanics, automotive tuning, and hands-on carpentry projects.</p>
            <p>My main focus is learning valuable trade skills, launching a successful local business, and working hard to build a strong foundation for financial independence.</p>
          </div>
        </div>
      </section>

      <section className="overview-section" aria-labelledby="overview-title">
        <div className="overview-heading">
          <div><p className="portfolio-eyebrow">At a glance</p><h2 id="overview-title">Quick overview</h2></div>
          <span className="overview-mark">AA / 2028</span>
        </div>
        <div className="overview-grid">
          {[
            ['Birthday', 'Feb 12'],
            ['High school', "Grossmont ('28)"],
            ['Trade focus', 'HVAC & trades'],
            ['Location', 'El Cajon, CA'],
          ].map(([label, value], index) => (
            <article className="overview-item" key={label} data-testid={`card-overview-${index + 1}`}>
              <span className="overview-number">0{index + 1}</span>
              <span className="overview-label">{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <ContactSection />
    </PortfolioShell>
  );
}

const phases = [
  {
    phase: 'Phase 1', name: 'High school foundations', years: '2024 – 2028', title: 'Academic completion & trade prep',
    items: [
      'Graduate from Grossmont High School in El Cajon (Class of 2028).',
      "Earn California Driver's License and acquire personal work transportation.",
      'Gain hands-on experience in automotive repairs, custom fabrication, and building basics.',
    ],
  },
  {
    phase: 'Phase 2', name: 'Trade certification & apprenticeship', years: '2028 – 2030', title: 'Technical training & field experience',
    items: [
      'Enroll in HVAC Technology & Building Construction programs in San Diego.',
      'Pass EPA Section 608 Universal Certification for handling all refrigerant types.',
      'Accumulate 3,000+ journeyman hours under experienced licensed contractors.',
    ],
  },
  {
    phase: 'Phase 3', name: 'Contractor licensing', years: '2030 – 2031', title: 'California CSLB state licensing',
    items: [
      'Pass the CSLB C-20 Warm-Air Heating, Ventilating & Air-Conditioning Trade Exam.',
      'Complete California Law & Business examination and OSHA 30 Construction safety.',
      'Secure required contractor bonds, general liability insurance, and state compliance.',
    ],
  },
  {
    phase: 'Phase 4', name: 'Business launch & scaling', years: 'Ultimate milestone', title: 'San Diego enterprise operations',
    items: [
      'Register independent Contracting LLC in San Diego County.',
      'Equip specialized service vehicles with modern diagnostic tools and equipment.',
      'Build long-term residential and commercial service contracts across East County & San Diego.',
    ],
  },
];

export function FuturePage() {
  return (
    <PortfolioShell active="future">
      <SectionHeading eyebrow="Roadmap / 2024 onward" title="Future plan" description="A practical route from high school to a licensed trade business." />
      <section className="future-objective portfolio-card" aria-labelledby="objective-title">
        <div>
          <p className="portfolio-eyebrow">Primary business objective</p>
          <h2 id="objective-title">Launch a licensed HVAC &amp; contracting company.</h2>
          <p>Establishing a premier licensed general contracting and HVAC enterprise in San Diego County, specializing in residential remodeling, climate control installation, and modern trade solutions.</p>
        </div>
        <div className="objective-location"><span>Target location</span><strong>San Diego, CA</strong><small>Class of 2028 &amp; beyond</small></div>
      </section>
      <section className="credential-row" aria-label="Planned qualifications">
        {[
          ['Specialty license', 'C-20 HVAC Contractor'],
          ['Key certification', 'EPA 608 Universal'],
          ['Safety standard', 'OSHA 30 Construction'],
          ['Business model', 'Licensed Trade LLC'],
        ].map(([label, value], index) => (
          <div className="credential" key={label} data-testid={`card-credential-${index + 1}`}>
            <span>{label}</span><strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="phases-section" aria-labelledby="phases-title">
        <div className="phases-heading"><div><p className="portfolio-eyebrow">One step at a time</p><h2 id="phases-title">Four-phase execution plan</h2></div><span>04 STAGES</span></div>
        <div className="phase-grid">
          {phases.map((phase, index) => (
            <article className={`phase-card${index === 3 ? ' phase-card-final' : ''}`} key={phase.phase} data-testid={`card-phase-${index + 1}`}>
              <div className="phase-topline"><span>{phase.phase} <i aria-hidden="true">/</i> {phase.name}</span><span className="phase-years">{phase.years}</span></div>
              <h3>{phase.title}</h3>
              <ul>{phase.items.map((item) => <li key={item}><span className="phase-bullet" aria-hidden="true" />{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>
    </PortfolioShell>
  );
}

const interests = [
  {
    title: 'Automotive Mechanics', icon: Wrench, imageLabel: 'Automotive / workshop notes',
    description: 'Passionate about engine performance, hands-on mechanical repairs, and maintaining Ford Mustangs.',
  },
  {
    title: 'Building & Contracting', icon: Building2, image: 'https://i.imgur.com/dWNlfjN.jpeg',
    alt: 'Custom made Coastal Florida getaway', description: 'Custom made Coastal Florida getaway.',
  },
  {
    title: 'Working Out', icon: Dumbbell, imageLabel: 'Training / fitness notes',
    description: 'Dedicated to weight training, physical fitness, discipline, and maintaining peak athletic conditioning.',
  },
  {
    title: 'Tactical Gaming', icon: Gamepad2, imageLabel: 'Team play / strategy notes',
    description: 'Competitive multiplayer gaming, tactical communication, and team strategy.',
  },
  {
    title: 'Outdoors & Recreation', icon: Mountain, imageLabel: 'San Diego County / trail notes',
    description: 'Exploring local hiking trails and outdoor scenery across San Diego County.',
  },
  {
    title: 'Listening to Music', icon: Music2, image: 'https://i.imgur.com/QiJSNli.jpeg',
    alt: 'Music and audio tracks', description: 'Streaming favorite hip-hop, rap, and high-energy tracks while working out or focusing on hands-on building projects.',
  },
];

export function InterestsPage() {
  return (
    <PortfolioShell active="interests">
      <SectionHeading eyebrow="Off the clock / On the bench" title="Core technical interests" description="Key domains shaping my skills and career path." />
      <section className="interest-grid" aria-label="Six interests">
        {interests.map((interest, index) => {
          const Icon = interest.icon;
          return (
            <article className="interest-card portfolio-card" key={interest.title} data-testid={`card-interest-${index + 1}`}>
              <div className="interest-card-heading">
                <h2>{interest.title}</h2><span>0{index + 1}</span>
              </div>
              {interest.image ? (
                <div className="interest-image">
                  <img src={interest.image} alt={interest.alt} referrerPolicy="no-referrer" data-testid={`img-interest-${index + 1}`} />
                </div>
              ) : (
                <div className="interest-placeholder" aria-label={interest.imageLabel}>
                  <Icon size={24} strokeWidth={1.45} aria-hidden="true" />
                  <span>{interest.imageLabel}</span>
                  <small>Personal photo not added</small>
                </div>
              )}
              <p>{interest.description}</p>
            </article>
          );
        })}
      </section>
    </PortfolioShell>
  );
}

const goals = [
  {
    period: 'Short-term', title: "Driver's license & savings",
    items: ["Pass CA driver's permit written exam", 'Start a part-time job in El Cajon', 'Acquire a Ford Mustang'],
  },
  {
    period: 'Mid-term', title: 'Trade certification',
    items: ['Graduate Grossmont High (2028)', 'Complete Trade School program', 'Earn EPA 608 Universal Certificate'],
  },
  {
    period: 'Long-term', title: 'Licensed business owner',
    items: ['Pass C-20 HVAC Contractor Exam', 'Launch Contracting LLC in San Diego', 'Build full-time employment independence'],
  },
];

export function GoalsPage() {
  return (
    <PortfolioShell active="goals">
      <SectionHeading eyebrow="What comes next" title="Personal & professional goals" description="Short-term, mid-term, and long-term milestones." />
      <section className="goals-grid" aria-label="Goals by timeframe">
        {goals.map((goal, index) => (
          <article className="goal-card portfolio-card" key={goal.period} data-testid={`card-goal-${index + 1}`}>
            <span className="goal-period">0{index + 1} <i aria-hidden="true">/</i> {goal.period}</span>
            <h2>{goal.title}</h2>
            <ul>{goal.items.map((item) => <li key={item}><span aria-hidden="true">—</span>{item}</li>)}</ul>
            <span className="goal-watermark" aria-hidden="true">0{index + 1}</span>
          </article>
        ))}
      </section>
      <div className="goals-note">
        <span className="portfolio-eyebrow">The direction</span>
        <p>Learn the work, earn the credentials, then build something of my own in San Diego.</p>
        <Link href="/future" className="text-link" data-testid="link-goals-roadmap">See the full roadmap <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
    </PortfolioShell>
  );
}