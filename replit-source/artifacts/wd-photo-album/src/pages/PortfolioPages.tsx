import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Compass,
  MapPin,
} from 'lucide-react';
import { useUser } from '@clerk/react';
import './PortfolioPages.css';
import './HomeRefresh.css';
import './TradeDetail.css';

type PortfolioPage = 'home' | 'media' | 'future' | 'contact' | 'inbox';

const navigation: { id: PortfolioPage; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'media', label: 'Media', href: '/media' },
  { id: 'future', label: 'Future Plan', href: '/future' },
  { id: 'contact', label: 'Contact', href: '/contact' },
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
  const [pathname] = useLocation();
  useEffect(() => {
    const titles: Record<PortfolioPage, string> = {
      home: 'Abdul Alawad | Student & Trades Portfolio',
      media: 'WD Photos | Abdul Alawad',
      future: 'Future Plan | Abdul Alawad',
      contact: 'Contact | Abdul Alawad',
      inbox: 'Messages | Abdul Alawad',
    };
    document.title = pathname === '/trade/hvac'
      ? 'HVAC Field Note | Abdul Alawad'
      : pathname === '/trade/construction'
        ? 'Construction Field Note | Abdul Alawad'
        : titles[active];
  }, [active, pathname]);

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
            <Link href="/trade/construction" className="learning-card trade-photo-card" data-testid="link-trade-construction-home" aria-label="Read the construction trade field note">
              <div className="learning-card-art trade-photo-art">
                <img src={`${import.meta.env.BASE_URL}images/trades/construction-framing.jpg`} alt="Wood wall framing taking shape, with evenly spaced studs forming the structure of a building." />
                <span className="art-index">FIELD NOTE / 01</span><span className="art-word">BUILD</span>
                <span className="trade-photo-caption">STRUCTURE / STUDY 01</span>
              </div>
              <div className="learning-card-copy">
                <div className="card-title-row"><span>01</span><h3>Construction</h3></div>
                <p>Building construction and carpentry projects. I want to understand the materials, the sequence, and the care behind solid work.</p>
                <span className="card-link">Read the construction field note <ArrowUpRight size={14} aria-hidden="true" /></span>
              </div>
            </Link>
            <Link href="/trade/hvac" className="learning-card trade-photo-card" data-testid="link-trade-hvac-home" aria-label="Read the HVAC trade field note">
              <div className="learning-card-art learning-card-hvac trade-photo-art">
                <img src={`${import.meta.env.BASE_URL}images/trades/hvac-service.jpg`} alt="Technician checking gauges beside an outdoor air-conditioning condenser." />
                <span className="art-index">FIELD NOTE / 02</span><span className="art-word">SYSTEMS</span>
                <span className="trade-photo-caption">AIR / COMFORT / CONTROL</span>
              </div>
              <div className="learning-card-copy">
                <div className="card-title-row"><span>02</span><h3>HVAC mechanics</h3></div>
                <p>Heating and cooling systems, how they work, and the practical skills it takes to maintain them.</p>
                <span className="card-link">Read the HVAC field note <ArrowUpRight size={14} aria-hidden="true" /></span>
              </div>
            </Link>
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
            <Link className="archive-link" href="/contact" data-testid="link-home-contact"><span className="archive-link-index">03</span><span className="archive-link-copy"><strong>Contact</strong><small>Get in touch</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
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
          { title: 'HVAC', label: 'Heating / ventilation / air conditioning', mark: 'HV', text: 'Understand how heating and cooling systems work, then build the skills to install, maintain, and repair them.', href: '/trade/hvac', image: 'hvac-service.jpg', alt: 'Technician checking gauges beside an outdoor air-conditioning condenser.' },
          { title: 'Construction', label: 'Building / structure / craft', mark: '02', text: 'Learn the materials, tools, and techniques behind solid construction and careful project work.', href: '/trade/construction', image: 'construction-framing.jpg', alt: 'Timber wall framing with upright studs and horizontal members defining a building structure.' },
        ].map((plan, index) => (
          <Link href={plan.href} className="archive-tile portfolio-card future-tile future-trade-link" key={plan.title} data-testid={`card-phase-${index + 1}`} style={{ '--tile-index': index } as CSSProperties} aria-label={`Explore the ${plan.title} trade field note`}>
            <div className="tile-visual">
              <img src={`${import.meta.env.BASE_URL}images/trades/${plan.image}`} alt={plan.alt} />
              <div className="trade-tile-filemark" aria-hidden="true"><span>WD / FIELD NOTES</span><strong>{plan.mark}</strong><small>{plan.label}</small></div>
              <div className="tile-caption">
                <div className="tile-caption-copy">
                  <small>Area {String(index + 1).padStart(2, '0')} / Future focus</small>
                  <h2>{plan.title}</h2>
                  <p>{plan.text}</p>
                </div>
                <span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
            </div>
          </Link>
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

type TradeKind = 'hvac' | 'construction';

const tradeDetails: Record<TradeKind, {
  title: string;
  deck: string;
  number: string;
  image: string;
  alt: string;
  other: TradeKind;
  sections: { eyebrow: string; title: string; paragraphs: string[]; list?: string[] }[];
}> = {
  hvac: {
    title: 'Heating, cooling & the systems between',
    deck: 'A closer look at the work behind comfortable, healthy indoor spaces—and a direction I want to learn more about.',
    number: '01',
    image: 'hvac-service.jpg',
    alt: 'Technician checking gauges beside an outdoor air-conditioning condenser.',
    other: 'construction',
    sections: [
      {
        eyebrow: 'The trade',
        title: 'Comfort is a system, not a single machine.',
        paragraphs: [
          'HVAC means heating, ventilation, and air conditioning. The trade brings together equipment, airflow, controls, and building conditions to help indoor spaces stay comfortable and properly ventilated.',
          'A technician may learn how air moves through ducts, how filters and coils affect performance, how thermostats communicate with equipment, and how to inspect a system methodically. Installation, maintenance, and troubleshooting all depend on careful measurement and sound safety habits.',
        ],
      },
      {
        eyebrow: 'Tools & systems',
        title: 'Measure first. Understand what the reading means.',
        paragraphs: ['The work can involve hand tools, filter and duct components, wiring diagrams, equipment manuals, and diagnostic instruments. Different jobs call for different tools; training and supervision determine what is appropriate.'],
        list: ['Air handlers, furnaces, heat pumps, and cooling equipment', 'Ductwork, filters, vents, thermostats, and control circuits', 'Basic measurement, inspection, documentation, and safe work practices'],
      },
      {
        eyebrow: 'Why it interests me',
        title: 'There is logic behind what you can feel.',
        paragraphs: [
          'I like that HVAC connects practical mechanical work with problem-solving. A room that is too warm or airflow that feels weak can have more than one cause, so learning to trace a system carefully sounds challenging in a good way.',
          'It is also useful work: the choices made during installation and maintenance affect comfort, energy use, and how reliably a building operates.',
        ],
      },
      {
        eyebrow: 'A safe first chapter',
        title: 'Start with observation and fundamentals.',
        paragraphs: ['A realistic first step is to study basic electricity and heat transfer, read introductory material from a reputable school or training program, and ask a qualified instructor or licensed professional about supervised ways to observe the trade.'],
        list: ['Use diagrams and classroom demonstrations to learn system parts and airflow concepts.', 'Practice only on de-energized, low-voltage training equipment with an instructor’s approval.', 'Never open energized equipment or handle refrigerant; electrical and refrigerant work require proper training, authorization, and supervision.'],
      },
    ],
  },
  construction: {
    title: 'Construction, from layout to structure',
    deck: 'Buildings begin with plans, materials, and a sequence of careful decisions. That process is what I want to understand.',
    number: '02',
    image: 'construction-framing.jpg',
    alt: 'Wood framing on a building site: vertical wall studs and horizontal framing members create the outline of a structure.',
    other: 'hvac',
    sections: [
      {
        eyebrow: 'The trade',
        title: 'Good building work starts before the first cut.',
        paragraphs: [
          'Construction turns plans and materials into places people can use. Carpentry is one part of that larger process, involving layout, framing, finish work, and coordination with other trades.',
          'Learners build an understanding of how measurements transfer from a plan to a structure, how materials behave, and why the order of operations matters. Accuracy, communication, and keeping a work area organized are part of the craft—not extras.',
        ],
      },
      {
        eyebrow: 'Tools & systems',
        title: 'A measured line can shape the whole project.',
        paragraphs: ['Depending on the task and training level, construction work may use layout tools, hand tools, power tools, fasteners, structural materials, and protective equipment. Tools should be introduced and used under qualified supervision.'],
        list: ['Plans, dimensions, levels, squares, chalk lines, and measuring tapes', 'Lumber, sheathing, fasteners, and framing assemblies', 'Personal protective equipment, site awareness, and safe material handling'],
      },
      {
        eyebrow: 'Why it interests me',
        title: 'You can see separate pieces become a whole.',
        paragraphs: [
          'Construction interests me because it combines hands-on skill with planning. I want to learn how builders keep work square and consistent, choose the right material for a task, and coordinate each stage so the finished result is dependable.',
          'There is a satisfying clarity to making something that lasts, but the responsibility behind that work matters just as much as the visible result.',
        ],
      },
      {
        eyebrow: 'A safe first chapter',
        title: 'Learn the language of a jobsite before using its tools.',
        paragraphs: ['A good first step could be a supervised school shop, introductory construction course, or visit with a qualified mentor. Start with drawings, measurement, material identification, and the safety rules for the space you are in.'],
        list: ['Practice measuring and marking scrap material using hand tools in an approved learning space.', 'Wear the required eye, hearing, and foot protection, and follow the instructor’s tool-specific directions.', 'Do not use power tools, climb ladders, or enter an active jobsite without permission, training, and direct supervision.'],
      },
    ],
  },
};

export function TradeDetailPage({ trade }: { trade: TradeKind }) {
  const detail = tradeDetails[trade];
  const other = tradeDetails[detail.other];

  return (
    <PortfolioShell active="future" className="trade-detail-root">
      <article className="trade-detail">
        <div className="trade-detail-topline">
          <p className="portfolio-eyebrow">WD / Future plan / Field note {detail.number}</p>
          <span>EL CAJON, CALIFORNIA <i aria-hidden="true">—</i> LEARNING AHEAD</span>
        </div>
        <header className="trade-detail-heading">
          <p className="trade-detail-index">TRADE STUDY / {detail.number}</p>
          <h1>{detail.title}</h1>
          <p className="trade-detail-deck">{detail.deck}</p>
        </header>
        <figure className="trade-detail-photo">
          <img src={`${import.meta.env.BASE_URL}images/trades/${detail.image}`} alt={detail.alt} />
          <figcaption><span>WD / FIELD NOTES</span><span>{trade === 'hvac' ? 'AIR + MECHANICAL SYSTEMS' : 'STRUCTURE + CARPENTRY'}</span></figcaption>
        </figure>
        <div className="trade-detail-body">
          {detail.sections.map((section, index) => (
            <section className="trade-detail-section" key={section.eyebrow}>
              <div className="trade-section-index"><span>0{index + 1}</span><small>{section.eyebrow}</small></div>
              <div className="trade-section-copy">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}
              </div>
            </section>
          ))}
        </div>
        <nav className="trade-detail-next" aria-label="Explore related trade pages">
          <Link href="/future" className="trade-next-link trade-next-back"><span>BACK TO THE PLAN</span><strong>Future Plan</strong><ArrowUpRight size={17} aria-hidden="true" /></Link>
          <Link href={`/trade/${detail.other}`} className="trade-next-link"><span>ANOTHER FIELD NOTE / {other.number}</span><strong>{other.title}</strong><ArrowUpRight size={17} aria-hidden="true" /></Link>
        </nav>
      </article>
    </PortfolioShell>
  );
}