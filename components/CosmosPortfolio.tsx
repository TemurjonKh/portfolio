"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { FaGithub, FaInstagram, FaKaggle, FaLinkedinIn } from "react-icons/fa6";
import { PiArrowDown, PiArrowUp, PiEnvelopeSimple, PiFilePdf } from "react-icons/pi";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ProjectGrid } from "@/components/ProjectGrid";
import { StarChart, type ChartProject } from "@/components/StarChart";
import { TRACKS, normalizeTrack } from "@/lib/media";
import type { PortfolioContent } from "@/lib/content";

const monthYear = (value: Date | string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : null;

/** Fades content up once as it scrolls into view. Renders instantly for reduced-motion users. */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Section({ id, index, title, lede, children, className = "" }: { id: string; index?: number; title: string; lede?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={"tk-section " + className} aria-labelledby={id + "-title"}>
      <div className="tk-shell">
        <Reveal className="tk-section__head">
          {index !== undefined && <span className="tk-section__index" aria-hidden="true">{String(index).padStart(2, "0")}</span>}
          <h2 id={id + "-title"}>{title}</h2>
          {lede && <p>{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className={"tk-link " + className}>{children}<span className="sr-only"> (opens in a new tab)</span></a>;
}

function CertificateItem({ certificate }: { certificate: PortfolioContent["certificates"][number] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const isImage = certificate.imageUrl && !certificate.imageUrl.toLowerCase().endsWith(".pdf");
  return (
    <li className="tk-cert">
      <div><strong>{certificate.title}</strong><span>{certificate.issuer}</span></div>
      {certificate.imageUrl && (isImage
        ? <button type="button" className="tk-link" onClick={() => setOpen(true)}>View</button>
        : <ExternalLink href={certificate.imageUrl}>View</ExternalLink>)}
      <AnimatePresence>
        {open && isImage && (
          <motion.div className="tk-lightbox" role="dialog" aria-modal="true" aria-label={certificate.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
            <button type="button" className="tk-lightbox__close" onClick={() => setOpen(false)} autoFocus>Close</button>
            <div className="tk-lightbox__image"><Image src={certificate.imageUrl!} alt={certificate.title + " certificate"} fill sizes="90vw" className="object-contain" /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function CosmosPortfolio({ content }: { content: PortfolioContent | null }) {
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = useMemo(() => {
    if (!content?.profile) return [];
    return [
      { id: "about", label: "About", show: true },
      { id: "work", label: "Work", show: content.projects.length > 0 },
      { id: "skills", label: "Skills", show: content.skillGroups.length > 0 },
      { id: "experience", label: "Experience", show: content.volunteers.length + content.activities.length > 0 },
      { id: "recognition", label: "Recognition", show: content.achievements.length + content.certificates.length > 0 },
    ].filter(item => item.show);
  }, [content]);

  // Highlights the nav link for whichever section is in view.
  useEffect(() => {
    if (!nav.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -55%", threshold: [0.05, 0.25, 0.5] });
    nav.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [nav]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  if (!content?.profile) {
    return <main className="cosmos tk-empty"><h1>This portfolio has no content yet.</h1><p>Run <code>npm run db:push</code> and <code>npm run db:seed</code>, then reload.</p></main>;
  }

  const { profile, education, projects, skillGroups, certificates, achievements, volunteers, activities, interests, languages, attachments } = content;
  const [firstName, ...rest] = profile.name.split(" ");
  const tracksInUse = TRACKS.filter(track => projects.some(project => normalizeTrack(project.track) === track.id));
  const inDevelopment = projects.filter(project => project.visibility === "teaser").length;
  const experience = [
    ...volunteers.map(entry => ({ ...entry, kind: "Volunteer", location: null as string | null })),
    ...activities.map(entry => ({ ...entry, kind: "Activity" })),
  ];
  const socials = [
    { label: "LinkedIn", url: profile.linkedinUrl, Icon: FaLinkedinIn },
    { label: "GitHub", url: profile.githubUrl, Icon: FaGithub },
    { label: "Instagram", url: profile.instagramUrl, Icon: FaInstagram },
    { label: "Kaggle", url: profile.kaggleUrl, Icon: FaKaggle },
  ].filter((link): link is { label: string; url: string; Icon: typeof FaGithub } => Boolean(link.url));

  const selectFromChart = (project: ChartProject) => setOpenProject(project.id);

  const actions = (
    <>
      {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="tk-button tk-button--solid" onClick={() => setMenuOpen(false)}><PiFilePdf aria-hidden="true" />Resume</a>}
      <a href="#contact" className="tk-button" onClick={() => setMenuOpen(false)}><PiEnvelopeSimple aria-hidden="true" />Get in touch</a>
    </>
  );
  const socialIcons = (
    <ul className="tk-socials" aria-label="Profiles">
      {socials.map(({ label, url, Icon }) => (
        <li key={label}><a href={url} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon aria-hidden="true" /></a></li>
      ))}
    </ul>
  );

  return (
    <main id="top" className="cosmos">
      <a href="#work" className="tk-skip">Skip to work</a>
      <CosmicBackground />

      <header className="tk-nav">
        <div className="tk-shell tk-nav__inner">
          {socialIcons}
          <nav aria-label="Sections" className="tk-nav__links">{nav.map(item => <a key={item.id} href={"#" + item.id} aria-current={active === item.id ? "true" : undefined}>{item.label}</a>)}</nav>
          <div className="tk-nav__actions">{actions}</div>
          <button type="button" className="tk-nav__toggle" aria-expanded={menuOpen} aria-controls="tk-menu" onClick={() => setMenuOpen(open => !open)}>
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        {menuOpen && (
          <div id="tk-menu" className="tk-menu">
            <nav aria-label="Sections">{nav.map(item => <a key={item.id} href={"#" + item.id} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>
            <div className="tk-menu__actions">{actions}</div>
          </div>
        )}
      </header>

      <section className="tk-hero tk-shell">
        <div className="tk-hero__copy">
          <p className="tk-hero__eyebrow"><span className="tk-pulse" aria-hidden="true" />{education[0] ? `${education[0].degree.replace(/^B\.S\.\s*/, "")} · ${education[0].institution}` : "Portfolio"}</p>
          <h1>{firstName}<span>{rest.join(" ")}</span></h1>
          <p className="tk-hero__tagline">{profile.tagline}</p>
          <div className="tk-hero__actions">
            {projects.length > 0 && <a href="#work" className="tk-button tk-button--solid">See the work<PiArrowDown aria-hidden="true" /></a>}
            {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="tk-button"><PiFilePdf aria-hidden="true" />Resume</a>}
            <a href="#contact" className="tk-button tk-button--quiet"><PiEnvelopeSimple aria-hidden="true" />Get in touch</a>
          </div>
        </div>
        {profile.photoUrl && (
          <figure className="tk-portrait">
            <svg className="tk-portrait__orbit" viewBox="0 0 400 500" aria-hidden="true">
              <g transform="rotate(-24 200 250)">
                <path id="tk-orbit-path" d="M 435 250 A 235 92 0 1 1 -35 250 A 235 92 0 1 1 435 250" />
                <circle className="tk-portrait__moon" r="4.5">
                  <animateMotion dur="24s" repeatCount="indefinite"><mpath href="#tk-orbit-path" /></animateMotion>
                </circle>
              </g>
            </svg>
            <div className="tk-portrait__frame">
              <Image src={profile.photoUrl} alt={profile.name} fill sizes="(max-width: 1020px) 80vw, 420px" className="object-cover" priority />
            </div>
            <figcaption>Incheon, South Korea</figcaption>
          </figure>
        )}
        {profile.quickFacts.length > 0 && (
          <dl className="tk-hero__facts">
            {profile.quickFacts.map(fact => <div key={fact.id}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
        )}
      </section>

      <Section id="about" index={1} title="About">
        <div className="tk-about">
          <Reveal><p className="tk-about__text">{profile.aboutText}</p></Reveal>
          {education.length > 0 && (
            <Reveal className="tk-about__side" delay={0.1}>
              {education.map(entry => (
                <div key={entry.id} className="tk-edu">
                  <p className="tk-meta">Education</p>
                  <p className="tk-edu__school">{entry.degree}</p>
                  <p className="tk-edu__inst">{entry.institution}{entry.location && `, ${entry.location}`}</p>
                  <dl className="tk-edu__facts">
                    <div><dt>Dates</dt><dd>{[monthYear(entry.startDate), entry.endDateLabel || monthYear(entry.endDate) || "present"].join(" – ")}</dd></div>
                    {entry.gpa && <div><dt>GPA</dt><dd>{entry.gpa}</dd></div>}
                  </dl>
                  {entry.coursework.length > 0 && <ul className="tk-tags tk-tags--quiet" aria-label="Coursework">{entry.coursework.map(course => <li key={course}>{course}</li>)}</ul>}
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </Section>

      {projects.length > 0 && (
        <Section
          id="work"
          index={2}
          title="Work"
          lede={`${projects.length} projects in ${tracksInUse.length} areas${inDevelopment ? `, ${inDevelopment} still in development` : ""}.`}
        >
          <ProjectGrid projects={projects} openId={openProject} onOpenChange={setOpenProject} />
          <Reveal className="tk-map">
            <div className="tk-map__copy">
              <p className="tk-meta">Where it’s heading</p>
              <p>Each star is a project. Together they chart a course from databases and sensors toward agents and games.</p>
            </div>
            <StarChart projects={projects} onSelect={selectFromChart} />
          </Reveal>
        </Section>
      )}

      {skillGroups.length > 0 && (
        <Section id="skills" index={3} title="Skills">
          <dl className="tk-skills">
            {skillGroups.map((group, i) => (
              <Reveal key={group.id} delay={i * 0.06}>
                <dt>{group.label}</dt>
                <dd><ul className="tk-tags">{group.items.map(item => <li key={item}>{item}</li>)}</ul></dd>
              </Reveal>
            ))}
          </dl>
        </Section>
      )}

      {experience.length > 0 && (
        <Section id="experience" index={4} title="Experience">
          <ol className="tk-timeline">
            {experience.map(entry => (
              <li key={entry.id} className={"tk-entry" + (entry.images.length ? " tk-entry--media" : "")}>
                <div className="tk-entry__body">
                  <p className="tk-meta">{[entry.kind, entry.dateLabel].filter(Boolean).join(" · ")}</p>
                  <h3>{entry.title}</h3>
                  {(entry.org || entry.location) && <p className="tk-entry__org">{[entry.org, entry.location].filter(Boolean).join(", ")}</p>}
                  {entry.description && <p className="tk-entry__text">{entry.description}</p>}
                </div>
                <MediaCarousel title={entry.title} items={entry.images} />
              </li>
            ))}
          </ol>
        </Section>
      )}

      {(achievements.length > 0 || certificates.length > 0) && (
        <Section id="recognition" index={5} title="Recognition">
          <div className="tk-recognition">
            {achievements.length > 0 && (
              <div>
                <h3>Awards</h3>
                <ul className="tk-awards">{achievements.map(item => <li key={item.id}><strong>{item.title}</strong>{item.description && <span>{item.description}</span>}</li>)}</ul>
              </div>
            )}
            {certificates.length > 0 && (
              <div>
                <h3>Certificates</h3>
                <ul className="tk-certs">{certificates.map(certificate => <CertificateItem key={certificate.id} certificate={certificate} />)}</ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {(interests.length > 0 || languages.length > 0) && (
        <Section id="beyond" index={6} title="Beyond the desk" className="tk-section--quiet">
          <div className="tk-beyond">
            {languages.length > 0 && (
              <div>
                <h3>Languages</h3>
                <dl className="tk-facts tk-facts--list">{languages.map(language => <div key={language.id}><dt>{language.name}</dt><dd>{language.level}</dd></div>)}</dl>
              </div>
            )}
            {interests.length > 0 && (
              <div>
                <h3>Interests</h3>
                <ul className="tk-interests">
                  {interests.map(interest => (
                    <li key={interest.id} className={interest.imageUrl ? "has-image" : ""}>
                      {interest.imageUrl && <span className="tk-interests__image"><Image src={interest.imageUrl} alt="" fill sizes="160px" className="object-cover" /></span>}
                      {interest.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {attachments.length > 0 && (
        <Section id="documents" title="Documents" className="tk-section--quiet">
          <ul className="tk-docs">{attachments.map(item => <li key={item.id}><ExternalLink href={item.fileUrl!}>{item.label}</ExternalLink></li>)}</ul>
        </Section>
      )}

      <footer id="contact" className="tk-section tk-contact" aria-labelledby="contact-title">
        <div className="tk-shell tk-contact__grid">
          <div>
            <p className="tk-meta">Contact</p>
            <h2 id="contact-title">Say hello<span>.</span></h2>
            <p className="tk-contact__lede">Research groups, studios, and teams working on game AI or intelligent systems: I’d like to hear from you.</p>
            <ul className="tk-contact__links">
              {profile.email && <li><PiEnvelopeSimple aria-hidden="true" /><a className="tk-link" href={"mailto:" + profile.email}>{profile.email}</a></li>}
              {profile.resumeUrl && <li><PiFilePdf aria-hidden="true" /><a className="tk-link" href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume (PDF)</a></li>}
            </ul>
            {profile.email && <p className="tk-contact__cta"><a className="tk-button tk-button--solid" href={"mailto:" + profile.email}><PiEnvelopeSimple aria-hidden="true" />Email me</a></p>}
            <div className="tk-contact__socials">{socialIcons}</div>
          </div>
        </div>
        <p className="tk-shell tk-colophon"><span>© {new Date().getFullYear()} {profile.name}</span><span>Incheon, South Korea</span></p>
      </footer>
      <a href="#top" className={"tk-top" + (scrolled ? " is-visible" : "")} aria-label="Back to top" aria-hidden={!scrolled} tabIndex={scrolled ? 0 : -1}><PiArrowUp aria-hidden="true" /></a>
    </main>
  );
}
