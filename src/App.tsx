import { useEffect, useState } from 'react'
import { pageContent, stories } from './data'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { FuturePanel, StoryCard } from './components/StoryCard'
import { Reveal } from './components/Reveal'
import { BookRevealScene } from './components/BookRevealScene'
import { AskArchivePanel } from './components/AskArchivePanel'
import { ShareStoryPanel } from './components/ShareStoryPanel'
import { ArchivePage } from './components/ArchivePage'

type AppPath = keyof typeof pageContent | '/'

function resolvePath(pathname: string): AppPath {
  if (pathname === '/archive' || pathname === '/share' || pathname === '/ask') return pathname
  return '/'
}

function App() {
  const [path, setPath] = useState<AppPath>(() => resolvePath(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setPath(resolvePath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath: string) => {
    const next = resolvePath(nextPath)
    window.history.pushState({}, '', next)
    setPath(next)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow ambient-glow--one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--two" aria-hidden="true" />
      <Header currentPath={path} onNavigate={navigate} />
      <main id="main-content">
        {path === '/' ? (
          <HomePage onNavigate={navigate} />
        ) : path === '/archive' ? (
          <div className="shell" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
            <ArchivePage />
          </div>
        ) : (
          <PreparedPage path={path} onNavigate={navigate} />
        )}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  )
}

type HomePageProps = {
  onNavigate: (path: string) => void
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero__copy">
          <div className="eyebrow hero__eyebrow"><span className="eyebrow__rule" /> A living archive for human wisdom</div>
          <h1 id="hero-title" className="hero__title">
            <span className="hero-line hero-line--one">Wisdom</span>
            <span className="hero-line hero-line--two">Should Never</span>
            <span className="hero-line hero-line--three"><em>Disappear.</em><span className="hero__asterisk">✦</span></span>
          </h1>
          <p className="hero__subtitle">Project Timeless preserves the knowledge we carry in our hands, our stories and the ways we care for one another — so it can keep guiding the generations ahead.</p>
          <div className="hero__actions">
            <button className="button button--primary" type="button" onClick={() => onNavigate('/share')}>Preserve a Story <Icon name="arrow-up-right" size={16} /></button>
            <button className="button button--text" type="button" onClick={() => onNavigate('/archive')}>Explore the Archive <Icon name="arrow-down" size={17} /></button>
          </div>
        </div>

        <div className="hero__visual" aria-label="Project Timeless cinematic introduction">
          <div className="archive-orbit archive-orbit--outer" aria-hidden="true" />
          <div className="archive-orbit archive-orbit--inner" aria-hidden="true" />
          <div className="hero-video-frame">
            <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
              <source src="/media/project-timeless-intro.mp4" type="video/mp4" />
            </video>
            <div className="hero-video__overlay" aria-hidden="true" />
            <div className="hero-video__label"><span className="live-dot"><i /> Silent cinematic introduction</span><span>Project Timeless · 01</span></div>
          </div>
          <div className="hero__caption"><span className="caption-line" /> A future home for what is worth carrying forward</div>
        </div>

        <a className="hero__scroll-cue" href="#memories" aria-label="Scroll to the animated memories and globe"><span>Scroll to explore</span><Icon name="arrow-down" size={16} /></a>
      </section>

      <BookRevealScene />

      <section className="section section--featured shell" id="featured" aria-labelledby="featured-title">
        <Reveal className="section-heading">
          <div>
            <span className="section-index">01 — The collection</span>
            <h2 id="featured-title">Stories with a pulse.</h2>
          </div>
          <p>Small, human moments can hold entire worlds. These examples show the spirit of what Timeless is being built to hold.</p>
        </Reveal>
        <div className="story-grid">
          {stories.map((story, index) => <StoryCard story={story} index={index} key={story.title} />)}
        </div>
        <Reveal className="section-cta" delay={180}>
          <button className="button button--outline" type="button" onClick={() => onNavigate('/archive')}>View the archive direction <Icon name="arrow-up-right" size={16} /></button>
        </Reveal>
      </section>

      <section className="section section--mission" aria-labelledby="mission-title">
        <div className="shell mission-grid">
          <Reveal className="mission-label"><span className="section-index">02 — Why it matters</span><span className="mission-vertical">THE THREAD BETWEEN US</span></Reveal>
          <Reveal className="mission-copy" delay={100}>
            <span className="eyebrow">A record of the human voice</span>
            <h2 id="mission-title">The future needs more than information.</h2>
            <p className="mission-lead">It needs the way a grandmother folds a letter. The pause before a difficult truth. The shortcut only a seasoned hand knows.</p>
            <p>Timeless is a place to preserve these details before they disappear — and to make them findable for the people who will need them next.</p>
            <button className="text-link" type="button" onClick={() => onNavigate('/share')}>Add your voice to the future <Icon name="arrow-up-right" size={16} /></button>
          </Reveal>
          <div className="mission-emblem" aria-hidden="true"><div className="mission-emblem__rings"><span /><span /><span /></div><span className="mission-emblem__caption">Keep what matters<br />in motion.</span></div>
        </div>
      </section>

      <section className="section section--process shell" aria-labelledby="process-title">
        <Reveal className="section-heading section-heading--process">
          <div><span className="section-index">03 — The approach</span><h2 id="process-title">Made for the meaning between the lines.</h2></div>
          <p>Wisdom is not a data point. The archive will be built around context, consent and the people behind every lesson.</p>
        </Reveal>
        <div className="process-grid">
          <Reveal className="process-step" delay={80}><span className="process-step__number">01</span><Icon name="quote" size={25} /><h3>Share the lived detail.</h3><p>Capture the practice, memory or insight in the voice of the person who knows it best.</p></Reveal>
          <Reveal className="process-step" delay={160}><span className="process-step__number">02</span><Icon name="layers" size={25} /><h3>Keep the context intact.</h3><p>Give every story a place, a lineage and the nuance that makes it useful beyond a single moment.</p></Reveal>
          <Reveal className="process-step" delay={240}><span className="process-step__number">03</span><Icon name="spark" size={25} /><h3>Pass it forward.</h3><p>Make the right wisdom easier to find when a future question needs a deeply human answer.</p></Reveal>
        </div>
      </section>

      <section className="section section--closing shell" aria-labelledby="closing-title">
        <Reveal className="closing-card">
          <div className="closing-card__glow" aria-hidden="true" />
          <span className="eyebrow">Begin with one memory</span>
          <h2 id="closing-title">What would you want<br /><em>someone to remember?</em></h2>
          <p>The archive starts with the stories we choose not to let go.</p>
          <button className="button button--primary" type="button" onClick={() => onNavigate('/share')}>Preserve a Story <Icon name="arrow-up-right" size={16} /></button>
        </Reveal>
      </section>
    </>
  )
}

type PreparedPageProps = {
  path: keyof typeof pageContent
  onNavigate: (path: string) => void
}

function PreparedPage({ path, onNavigate }: PreparedPageProps) {
  const content = pageContent[path]
  const isAskPage = path === '/ask'
  const isSharePage = path === '/share'
  return (
    <section className="prepared-page shell" aria-labelledby="prepared-title">
      <div className="prepared-page__copy">
        <div className="eyebrow"><span className="eyebrow__rule" /> {content.eyebrow}</div>
        <h1 id="prepared-title">{content.title}</h1>
        <p className="prepared-page__lead">{content.copy}</p>
        {isAskPage ? <AskArchivePanel /> : isSharePage ? <ShareStoryPanel /> : <>
          <div className="notice-card"><span className="notice-card__icon"><Icon name="spark" size={17} /></span><div><strong>Not connected yet</strong><p>{content.note}</p></div></div>
          <button className="button button--primary" type="button" onClick={() => onNavigate('/')}>{content.cta} <Icon name="arrow-up-right" size={16} /></button>
        </>}
      </div>
      <div className="prepared-page__visual"><FuturePanel label={isAskPage ? 'Nebius · Nemotron intelligence' : isSharePage ? 'Story capture · local draft' : 'Future archive index'} /><div className="prepared-page__orb" aria-hidden="true"><div /><div /></div></div>
    </section>
  )
}

export default App
