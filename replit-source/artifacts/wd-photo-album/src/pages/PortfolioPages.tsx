import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  ArrowUpRight,
} from 'lucide-react';
import { useUser } from '@clerk/react';
import './PortfolioPages.css';

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
    <header className="archive-masthead page-masthead">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="archive-subtitle">{description}</p>
    </header>
  );
}

function ArchiveTile({
  title,
  label,
  description,
  index,
  image,
  alt,
  className = '',
  visual,
  testId,
  imageTestId,
}: {
  title: string;
  label: string;
  description?: string;
  index: number;
  image?: string;
  alt?: string;
  className?: string;
  visual?: ReactNode;
  testId?: string;
  imageTestId?: string;
}) {
  return (
    <article
      className={`archive-tile portfolio-card ${className}`}
      style={{ '--tile-index': index } as CSSProperties}
      data-testid={testId ?? `card-archive-${index + 1}`}
    >
      <div className="tile-visual">
        {image ? <img src={image} alt={alt ?? ''} referrerPolicy="no-referrer" data-testid={imageTestId} /> : visual}
        <div className="tile-caption">
          <div className="tile-caption-copy">
            <small>{label}</small>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
    </article>
  );
}

function TypeTileVisual({ top, glyph, bottom }: { top: string; glyph: string; bottom: string }) {
  return (
    <div className="tile-text-visual" aria-hidden="true">
      <div className="tile-text-top"><span>WD / FIELD NOTES</span><span>{top}</span></div>
      <span className="tile-glyph">{glyph}</span>
      <span className="tile-text-label">{bottom}</span>
    </div>
  );
}

export function HomePage() {
  return (
    <PortfolioShell active="home">
      <header className="archive-masthead home-masthead">
        <p className="portfolio-eyebrow">WD / Personal archive / 01</p>
        <h1 id="home-title">Abdul <span>Alawad</span></h1>
        <p className="archive-subtitle">A student-and-trades archive from El Cajon, California. School, practical work, and what comes next.</p>
      </header>
      <div className="archive-meta home-meta">
        <span>Selected pages / <strong>Profile &amp; practice</strong></span>
        <div className="archive-quicklinks">
          <Link href="/media" data-testid="link-view-media">View media portfolio <ArrowUpRight size={13} aria-hidden="true" /></Link>
          <Link href="/contact" data-testid="link-home-contact">Get in touch <ArrowUpRight size={13} aria-hidden="true" /></Link>
        </div>
      </div>
      <section className="archive-grid home-grid" aria-label="Profile archive">
        <ArchiveTile
          index={0}
          className="tile-portrait"
          label="Profile / El Cajon, CA"
          title="Abdul Alawad"
          description="Student / Trades"
          image="https://i.imgur.com/OzBr4cB.jpeg"
          alt="Abdul Alawad"
          imageTestId="img-profile"
        />
        <ArchiveTile
          index={1}
          className="tile-wide"
          label="Study / Current focus"
          title="Building a practical foundation."
          description="High school student focusing on building construction, automotive mechanics, and trade skills."
          visual={<TypeTileVisual top="Grossmont / 2028" glyph="01" bottom="Learning by making things / student to skilled trades" />}
        />
        <ArchiveTile
          index={2}
          className="tile-profile-note"
          label="Practice / Areas of interest"
          title="Hands-on work"
          description="Structural building, HVAC system mechanics, automotive tuning, and carpentry projects."
          visual={<TypeTileVisual top="Trade studies" glyph="HVAC" bottom="Tools, systems, and the details that make a job work." />}
        />
        <ArchiveTile
          index={3}
          className="tile-profile-note"
          label="Direction / Long view"
          title="Build toward independence."
          description="Learn valuable trade skills, launch a successful local business, and work toward financial independence."
          visual={<TypeTileVisual top="San Diego County" glyph="→" bottom="Skills first / a local business in time" />}
        />
      </section>

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