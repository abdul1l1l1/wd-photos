import { useEffect, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './_group.css';

type PortfolioPage = 'home' | 'media' | 'future' | 'contact' | 'inbox' | 'goals';

const navigation: { id: PortfolioPage; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'media', label: 'Media', href: '/media' },
  { id: 'future', label: 'Future Plan', href: '/future' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'goals', label: 'Goals', href: '/goals' },
];

function Link({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  return <a href={href} {...props} onClick={(event) => event.preventDefault()} />;
}

function PortfolioNav({ active }: { active: PortfolioPage }) {
  const isSignedIn = false;
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

function PortfolioHeader({ active }: { active: PortfolioPage }) {
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

function PortfolioShell({ active, children }: { active: Exclude<PortfolioPage, 'media'>; children: ReactNode }) {
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

export function Current() {
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