import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Compass,
  Hammer,
  MapPin,
  Wrench,
} from 'lucide-react';
import { useUser } from '@clerk/react';
import './PortfolioPages.css';
import './HomeRefresh.css';

type PortfolioPage = 'home' | 'media' | 'future' | 'contact' | 'inbox' | 'goals';

const navigation: { id: PortfolioPage; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'media', label: 'Media', href: '/media' },
  { id: 'future', label: 'Future Plan', href: '/future' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'goals', label: 'Goals', href: '/goals' },
];

export function PortfolioNav({ active }: { active: PortfolioPage }) {
  const { isSignedIn } = useUser();
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
      {isSignedIn && <Link href="/messages" className={`portfolio-nav-link${active === 'inbox' ? ' is-active' : ''}`} aria-current={active === 'inbox' ? 'page' : undefined} data-testid="link-portfolio-inbox">Inbox</Link>}
    </nav>
  );
}

export function PortfolioHeader({ active }: { active: PortfolioPage }) {
  useEffect(() => {
    const titles: Record<PortfolioPage, string> = {
      home: 'Abdul Alawad | Student & Trades Portfolio',
      media: 'WD Photos | Abdul Alawad',
      future: 'Future Plan | Abdul Alawad',
      contact: 'Contact | Abdul Alawad',
      inbox: 'Messages | Abdul Alawad',
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

export function PortfolioShell({
  active,
  children,
  className = '',
}: {
  active: Exclude<PortfolioPage, 'media'>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`portfolio-root${className ? ` ${className}` : ''}`}>
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
    <header className="archive-masthead page-masthead">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="archive-subtitle">{description}</p>
    </header>
  );
}

function AnonymousProfile() {
  return (
    <div className="anonymous-profile" role="img" aria-label="Default anonymous profile placeholder">
      <span className="anonymous-stamp">PROFILE<br />NOT SHOWN</span>
      <svg viewBox="0 0 240 280" aria-hidden="true" focusable="false">
        <circle className="profile-head" cx="120" cy="84" r="44" />
        <path className="profile-shoulders" d="M33 250c5-59 37-91 87-91s82 32 87 91H33Z" />
      </svg>
      <span className="profile-code">WD—01 / EL CAJON</span>
    </div>
  );
}

function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return <p className="refresh-section-label"><span>{index}</span>{children}</p>;
}

export function HomePage() {
  return (
    <PortfolioShell active="home" className="home-refresh-root">
      <div className="refresh-page">
        <section className="refresh-hero" aria-labelledby="home-title">
          <div className="hero-paper">
            <div className="hero-topline">
              <p className="portfolio-eyebrow">WD / Personal archive / 01</p>
              <span className="hero-edition">EL CAJON, CALIFORNIA <i aria-hidden="true">—</i> EST. IN PROGRESS</span>
            </div>
            <div className="hero-body">
              <div className="hero-copy">
                <p className="hero-intro">A student learning the work, one skill at a time.</p>
                <h1 id="home-title">Abdul<br /><span>Alawad</span><b aria-hidden="true">.</b></h1>
                <p className="hero-summary">School, practical skills, and a direction worth working toward. This is my record of what I’m learning and what I want to build next.</p>
                <div className="hero-actions">
                  <Link className="refresh-button" href="/media" data-testid="link-view-media">
                    See the photo archive <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                  <Link className="refresh-text-link" href="/future" data-testid="link-hero-future">Where I’m headed <ArrowDown size={14} aria-hidden="true" /></Link>
                </div>
              </div>
              <figure className="hero-profile">
                <AnonymousProfile />
                <figcaption><span>01—A</span> Personal profile / image withheld</figcaption>
              </figure>
            </div>
            <div className="hero-bottomline">
              <span><MapPin size={13} aria-hidden="true" /> EL CAJON, SAN DIEGO COUNTY</span>
              <span>STUDENT <i aria-hidden="true">/</i> TRADES</span>
              <a href="#working-notes" aria-label="Scroll to working notes">SCROLL TO READ <ArrowDown size={12} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="intro-strip" aria-label="At a glance">
          <div className="intro-strip-title">
            <SectionLabel index="AT A GLANCE">A little about this archive</SectionLabel>
            <p>Not a résumé. Just a clear look at what matters to me right now.</p>
          </div>
          <div className="intro-fact"><span>IN SCHOOL</span><strong>Grossmont High</strong><small>Class of 2028</small></div>
          <div className="intro-fact"><span>LEARNING ABOUT</span><strong>Building + mechanics</strong><small>Trade skills, hands-on</small></div>
          <div className="intro-fact"><span>FROM</span><strong>El Cajon, CA</strong><small>San Diego County</small></div>
        </section>

        <section className="learning-section" id="working-notes" aria-labelledby="learning-title">
          <div className="learning-heading">
            <div><SectionLabel index="01 / CURRENT FOCUS">Working notes</SectionLabel><h2 id="learning-title">Learn it.<br /><em>Use it.</em></h2></div>
            <p className="learning-deck">I’m interested in how things fit together—from the structure of a building to the systems that keep it running.</p>
          </div>
          <div className="learning-grid">
            <article className="learning-card learning-card-feature">
              <div className="learning-card-art" aria-hidden="true"><span className="art-index">FIELD NOTE / 01</span><Hammer className="learning-icon" strokeWidth={1.15} /><span className="art-word">BUILD</span><span className="art-crosshair">+</span></div>
              <div className="learning-card-copy">
                <div className="card-title-row"><span>01</span><h3>Construction</h3></div>
                <p>Building construction and carpentry projects. I want to understand the materials, the sequence, and the care behind solid work.</p>
                <Link href="/future" className="card-link" data-testid="link-construction-future">Explore my future plan <ArrowUpRight size={14} aria-hidden="true" /></Link>
              </div>
            </article>
            <article className="learning-card">
              <div className="learning-card-art learning-card-hvac" aria-hidden="true"><span className="art-index">FIELD NOTE / 02</span><Wrench className="learning-icon" strokeWidth={1.15} /><span className="art-word">SYSTEMS</span><span className="hvac-lines"><i /><i /><i /></span></div>
              <div className="learning-card-copy">
                <div className="card-title-row"><span>02</span><h3>HVAC mechanics</h3></div>
                <p>Heating and cooling systems, how they work, and the practical skills it takes to maintain them.</p>
                <Link href="/goals" className="card-link" data-testid="link-hvac-goals">See goals in progress <ArrowUpRight size={14} aria-hidden="true" /></Link>
              </div>
            </article>
            <article className="learning-card">
              <div className="learning-card-art learning-card-auto" aria-hidden="true"><span className="art-index">FIELD NOTE / 03</span><span className="auto-mark">4<span>×</span>4</span><span className="art-word">MACHINES</span><div className="auto-track"><i /><i /><i /><i /></div></div>
              <div className="learning-card-copy">
                <div className="card-title-row"><span>03</span><h3>Automotive</h3></div>
                <p>Automotive mechanics and tuning—learning what’s under the hood, not just how it looks.</p>
                <Link href="/media" className="card-link" data-testid="link-automotive-media">Browse the media archive <ArrowUpRight size={14} aria-hidden="true" /></Link>
              </div>
            </article>
          </div>
        </section>

        <section className="direction-section" aria-labelledby="direction-title">
          <div className="direction-marker"><Compass size={20} strokeWidth={1.3} aria-hidden="true" /><span>02 / DIRECTION</span></div>
          <div className="direction-copy">
            <h2 id="direction-title">Skills first.<br /><span>Independence next.</span></h2>
            <p>The long view is to build valuable trade skills, start a successful local business, and work toward financial independence. For now, that starts with learning the fundamentals well.</p>
            <Link className="direction-link" href="/future" data-testid="link-direction-future">Read the future plan <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="direction-note" aria-label="Direction summary"><span>THE LONG VIEW</span><strong>A local business<br />in time.</strong><small>San Diego County</small><div className="note-rule" /><span>THE NEXT STEP</span><strong>Keep learning<br />the work.</strong></div>
        </section>

        <section className="archive-links" aria-labelledby="archive-title">
          <div className="archive-links-heading"><SectionLabel index="03 / OPEN THE ARCHIVE">Choose a page</SectionLabel><h2 id="archive-title">Go a little further.</h2></div>
          <div className="archive-link-list">
            <Link className="archive-link" href="/media" data-testid="link-home-media"><span className="archive-link-index">01</span><span className="archive-link-copy"><strong>Media</strong><small>Photos and visual notes</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link className="archive-link" href="/future" data-testid="link-home-future"><span className="archive-link-index">02</span><span className="archive-link-copy"><strong>Future Plan</strong><small>Trades I want to learn</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link className="archive-link" href="/goals" data-testid="link-home-goals"><span className="archive-link-index">03</span><span className="archive-link-copy"><strong>Goals</strong><small>Now, next, and further ahead</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link className="archive-link" href="/contact" data-testid="link-home-contact"><span className="archive-link-index">04</span><span className="archive-link-copy"><strong>Contact</strong><small>Get in touch</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="closing-note" aria-label="Closing note">
          <BookOpen size={22} strokeWidth={1.4} aria-hidden="true" />
          <p>This archive is a work in progress.<br /><span>So am I.</span></p>
          <a href="mailto:abdulalawad80@gmail.com" data-testid="link-closing-contact">Say hello <ArrowUpRight size={14} aria-hidden="true" /></a>
        </section>
      </div>
    </PortfolioShell>
  );
}

export function FuturePage() {
  return (
    <PortfolioShell active="future">
      <SectionHeading eyebrow="Future plan / working direction" title="Two trades. One foundation." description="HVAC and construction are the path I want to keep learning through school, practice, and real work." />
      <div className="archive-meta">
        <span>Focus / <strong>HVAC + construction</strong></span>
        <span>Learn / Practice / Build</span>
      </div>
      <section className="archive-grid future-grid simple-future-grid" aria-label="Future trade interests">
        {[
          { title: 'HVAC', label: 'Heating / ventilation / air conditioning', mark: 'HV', text: 'Understand how heating and cooling systems work, then build the skills to install, maintain, and repair them.' },
          { title: 'Construction', label: 'Building / structure / craft', mark: '02', text: 'Learn the materials, tools, and techniques behind solid construction and careful project work.' },
        ].map((plan, index) => (
          <article className="archive-tile portfolio-card future-tile" key={plan.title} data-testid={`card-phase-${index + 1}`} style={{ '--tile-index': index } as CSSProperties}>
            <div className="tile-visual">
              <div className="tile-text-visual" aria-hidden="true">
                <div className="tile-text-top"><span>WD / FIELD NOTES</span><span>0{index + 1}</span></div>
                <span className="tile-glyph">{plan.mark}</span>
                <span className="tile-text-label">{plan.label}</span>
              </div>
              <div className="tile-caption">
                <div className="tile-caption-copy">
                  <small>Area {String(index + 1).padStart(2, '0')} / Future focus</small>
                  <h2>{plan.title}</h2>
                  <p>{plan.text}</p>
                </div>
                <span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="future-objective" aria-labelledby="objective-title">
        <div>
          <p className="portfolio-eyebrow">The next step</p>
          <h2 id="objective-title">Learn the work before planning too far ahead.</h2>
          <p>For now, the focus is a strong foundation in HVAC and construction: ask questions, practice safely, and keep improving.</p>
        </div>
        <div className="objective-location"><span>Approach</span><strong>Hands-on learning</strong><small>One skill at a time</small></div>
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
      <div className="archive-meta">
        <span>Index / <strong>Three horizons</strong></span>
        <span>Now / Next / Further ahead</span>
      </div>
      <section className="archive-grid goals-grid" aria-label="Goals by timeframe">
        {goals.map((goal, index) => (
          <article className="archive-tile portfolio-card goal-tile" key={goal.period} data-testid={`card-goal-${index + 1}`} style={{ '--tile-index': index } as CSSProperties}>
            <div className="tile-visual">
              <div className="tile-text-visual" aria-hidden="true">
                <div className="tile-text-top"><span>WD / GOALS</span><span>0{index + 1}</span></div>
                <span className="tile-glyph">{['01', '02', '03'][index]}</span>
                <span className="tile-text-label">{goal.period} / time horizon</span>
              </div>
              <div className="tile-caption">
                <div className="tile-caption-copy">
                  <small>0{index + 1} / {goal.period}</small>
                  <h2>{goal.title}</h2>
                  <ul className="goal-list">{goal.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </div>
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