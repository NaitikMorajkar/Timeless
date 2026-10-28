import { useState, useMemo } from 'react'
import { stories } from '../data'
import type { Story } from '../data'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

const ALL_CATEGORIES = Array.from(new Set(stories.map(s => s.category)))

const EXTENDED_STORIES: Story[] = [
  ...stories,
  {
    title: 'Bread that waits for the baker',
    excerpt: 'The slow art of reading a dough — how touch, time and temperature speak if you listen.',
    category: 'Craft & Making',
    place: 'Example story · Lyon, France',
    year: '1971',
    accent: 'amber',
  },
  {
    title: 'The naming of the monsoon',
    excerpt: 'How a coastal village maps the year by wind names no official chart has ever recorded.',
    category: 'Land & Stewardship',
    place: 'Example story · Kozhikode, India',
    year: '2002',
    accent: 'sage',
  },
  {
    title: 'A letter that took thirty years',
    excerpt: 'A tradition of deferred correspondence — words meant for the person you will become.',
    category: 'Ritual & Culture',
    place: 'Example story · Oaxaca, Mexico',
    year: '1993',
    accent: 'rose',
  },
  {
    title: 'What the elders call silence',
    excerpt: 'The practice of sitting with discomfort — a form of care that has no equivalent word in English.',
    category: 'Ritual & Culture',
    place: 'Example story · Kyoto, Japan',
    year: '1958',
    accent: 'rose',
  },
  {
    title: 'Iron, charcoal and patience',
    excerpt: 'A swordsmith on the three years it takes to understand a blade — and why less is never less.',
    category: 'Craft & Making',
    place: 'Example story · Seki, Japan',
    year: '1987',
    accent: 'amber',
  },
  {
    title: 'Tending the seed library',
    excerpt: 'How a community keeps hundreds of crop varieties alive — and why each one is a decision about the future.',
    category: 'Land & Stewardship',
    place: 'Example story · Oaxaca Valley, Mexico',
    year: '2011',
    accent: 'sage',
  },
]

function ArchiveCard({ story, index }: { story: Story; index: number }) {
  return (
    <Reveal className="story-card-reveal" delay={index * 60}>
      <article className={`story-card story-card--${story.accent}`}>
        <div className="story-card__topline">
          <span className="eyebrow eyebrow--small">{story.category}</span>
          <span className="story-card__year">{story.year}</span>
        </div>
        <div className="story-card__shape" aria-hidden="true"><span /><span /><span /></div>
        <div className="story-card__body">
          <span className="story-card__example"><Icon name="bookmark" size={13} /> Example story</span>
          <h3>{story.title}</h3>
          <p>{story.excerpt}</p>
        </div>
        <div className="story-card__footer">
          <span>{story.place}</span>
          <Icon name="arrow-up-right" size={16} />
        </div>
      </article>
    </Reveal>
  )
}

export function ArchivePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return EXTENDED_STORIES.filter(s => {
      const matchesCategory = !activeCategory || s.category === activeCategory
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q) ||
        s.place.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  return (
    <div className="archive-page">
      {/* Header */}
      <Reveal className="archive-page__header">
        <span className="eyebrow"><span className="eyebrow__rule" /> The collection</span>
        <h1 id="archive-title">A living index of<br /><em>what matters.</em></h1>
        <p className="archive-page__lead">
          The archive brings lived experience, cultural knowledge and practical wisdom into view —
          without flattening the stories that hold them.
        </p>
      </Reveal>

      {/* Search + Filters */}
      <Reveal className="archive-controls" delay={80}>
        <div className="archive-search">
          <span className="archive-search__icon" aria-hidden="true">
            <Icon name="spark" size={14} />
          </span>
          <input
            type="search"
            className="archive-search__input"
            placeholder="Search stories, places, or themes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search the archive"
          />
          {query && (
            <button
              className="archive-search__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <div className="archive-filters" role="group" aria-label="Filter by category">
          <button
            className={`archive-filter-btn${!activeCategory ? ' is-active' : ''}`}
            onClick={() => setActiveCategory(null)}
            type="button"
          >
            All
          </button>
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`archive-filter-btn${activeCategory === cat ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(prev => (prev === cat ? null : cat))}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Meta row */}
      <div className="archive-meta">
        <span className="archive-meta__count">
          {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}{' '}
          {activeCategory ? `in ${activeCategory}` : 'in the archive'}
        </span>
        <span className="archive-meta__note">Example entries · full archive coming soon</span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="story-grid archive-grid">
          {filtered.map((story, index) => (
            <ArchiveCard key={story.title} story={story} index={index} />
          ))}
        </div>
      ) : (
        <Reveal className="archive-empty">
          <span className="archive-empty__icon" aria-hidden="true">✦</span>
          <p>No stories match <em>"{query}"</em>{activeCategory ? ` in ${activeCategory}` : ''}.</p>
          <button
            className="button button--outline button--small"
            type="button"
            onClick={() => { setQuery(''); setActiveCategory(null) }}
          >
            Clear filters
          </button>
        </Reveal>
      )}

      {/* Footer note */}
      <Reveal className="archive-notice" delay={120}>
        <div className="notice-card">
          <span className="notice-card__icon"><Icon name="spark" size={17} /></span>
          <div>
            <strong>Foundation preview</strong>
            <p>These are example stories illustrating the spirit of what Timeless will hold. Real submissions will populate the archive as the project grows.</p>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
