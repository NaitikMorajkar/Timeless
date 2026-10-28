import type { Story } from '../data'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

type StoryCardProps = {
  story: Story
  index: number
}

export function StoryCard({ story, index }: StoryCardProps) {
  return (
    <Reveal className="story-card-reveal" delay={index * 100}>
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

export function FuturePanel({ label = 'Future-ready pattern' }: { label?: string }) {
  return (
    <div className="future-panel" aria-label="Future feature preview">
      <div className="future-panel__heading">
        <span className="eyebrow eyebrow--small">{label}</span>
        <span className="future-panel__dot" aria-hidden="true" />
      </div>
      <div className="skeleton skeleton--long" aria-hidden="true" />
      <div className="skeleton skeleton--medium" aria-hidden="true" />
      <div className="skeleton-row" aria-hidden="true">
        <div className="skeleton skeleton--short" />
        <div className="skeleton skeleton--tiny" />
      </div>
      <p>This quiet loading language is ready for the archive when its real data arrives.</p>
    </div>
  )
}
