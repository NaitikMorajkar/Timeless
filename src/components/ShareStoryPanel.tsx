import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Icon } from './Icon'

const CATEGORIES = ['Craft & Making', 'Ritual & Culture', 'Land & Stewardship', 'Memory & Family', 'Body & Healing', 'Community & Place']

type FormData = {
  title: string
  story: string
  category: string
  place: string
  year: string
  name: string
  consent: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>
type Stage = 'form' | 'review' | 'success'

const EMPTY: FormData = { title: '', story: '', category: '', place: '', year: '', name: '', consent: false }

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.title.trim()) errors.title = 'A title helps the archive give this story a home.'
  else if (data.title.trim().length < 5) errors.title = 'Please give the title a little more.'
  if (!data.story.trim()) errors.story = 'The story itself is the heart of this entry.'
  else if (data.story.trim().length < 30) errors.story = 'Please share a little more detail — even a few sentences make a difference.'
  if (!data.category) errors.category = 'Choose the category that fits best.'
  if (!data.consent) errors.consent = 'Please confirm you\'re happy for this to be preserved.'
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="share-field__error" role="alert">{message}</p>
}

export function ShareStoryPanel() {
  const [stage, setStage] = useState<Stage>('form')
  const [data, setData] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const next = { ...data, [field]: value }
      const errs = validate(next as FormData)
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
  }

  const blur = (field: keyof FormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const errs = validate(data)
    setErrors(prev => ({ ...prev, [field]: errs[field] }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(EMPTY).map(k => [k, true]))
    setTouched(allTouched as typeof touched)
    const errs = validate(data)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStage('review')
  }

  const handleConfirm = () => setStage('success')

  const handleReset = () => {
    setData(EMPTY)
    setErrors({})
    setTouched({})
    setStage('form')
  }

  if (stage === 'success') {
    return (
      <div className="share-success" role="status" aria-live="polite">
        <div className="share-success__emblem" aria-hidden="true">
          <span className="share-success__star">✦</span>
          <div className="share-success__rings"><span /><span /></div>
        </div>
        <span className="eyebrow eyebrow--small">Received · preserved</span>
        <h2 className="share-success__title">Thank you for<br /><em>this memory.</em></h2>
        <p>
          <strong>{data.title}</strong> has been noted. When the full archive opens, stories like this will help future generations find wisdom grounded in lived experience.
        </p>
        <p className="share-success__note">This is a foundation preview — submissions are captured locally and not yet stored on a server. Your entry will be part of the first real archive batch.</p>
        <button className="button button--outline button--small" type="button" onClick={handleReset}>
          Preserve another story <Icon name="arrow-up-right" size={14} />
        </button>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className="share-review">
        <div className="share-review__header">
          <span className="eyebrow eyebrow--small"><span className="eyebrow__rule" /> Review before preserving</span>
        </div>
        <div className="share-review__card">
          <div className="share-review__topline">
            <span className="eyebrow eyebrow--small">{data.category}</span>
            {data.year && <span className="story-card__year">{data.year}</span>}
          </div>
          <h3 className="share-review__title">{data.title}</h3>
          <p className="share-review__body">{data.story}</p>
          {(data.place || data.name) && (
            <div className="share-review__meta">
              {data.place && <span>{data.place}</span>}
              {data.name && <span>Shared by {data.name}</span>}
            </div>
          )}
        </div>
        <div className="share-review__actions">
          <button className="button button--outline button--small" type="button" onClick={() => setStage('form')}>
            Edit
          </button>
          <button className="button button--primary button--small" type="button" onClick={handleConfirm}>
            Preserve this story <Icon name="arrow-up-right" size={14} />
          </button>
        </div>
        <p className="share-review__consent-note">
          By confirming, you agree that this story may be preserved in the Project Timeless archive and made discoverable by future generations.
        </p>
      </div>
    )
  }

  return (
    <form className="share-form" onSubmit={handleSubmit} noValidate aria-label="Preserve a story">

      <div className="share-form__intro">
        <span className="eyebrow eyebrow--small"><span className="eyebrow__rule" /> Your story</span>
      </div>

      {/* Title */}
      <div className={`share-field${errors.title && touched.title ? ' share-field--error' : ''}`}>
        <label className="share-field__label" htmlFor="story-title">
          A title for this memory <span className="share-field__required" aria-label="required">✦</span>
        </label>
        <input
          id="story-title"
          className="share-field__input"
          type="text"
          placeholder="The patience of a hand plane"
          value={data.title}
          maxLength={120}
          onChange={set('title')}
          onBlur={blur('title')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        <FieldError message={touched.title ? errors.title : undefined} />
      </div>

      {/* Story */}
      <div className={`share-field${errors.story && touched.story ? ' share-field--error' : ''}`}>
        <label className="share-field__label" htmlFor="story-body">
          The story <span className="share-field__required" aria-label="required">✦</span>
        </label>
        <p className="share-field__hint">Write in your own voice. The detail, the texture, the memory of how it felt — that's what the archive is here to hold.</p>
        <textarea
          id="story-body"
          className="share-field__textarea"
          placeholder="A quiet lesson in reading the grain, listening to the tool and letting the work set the pace. My grandfather would spend an entire morning on a single board…"
          value={data.story}
          maxLength={4000}
          rows={7}
          onChange={set('story')}
          onBlur={blur('story')}
          aria-invalid={!!errors.story}
          aria-describedby={errors.story ? 'story-error' : 'story-count'}
        />
        <div className="share-field__footer">
          <FieldError message={touched.story ? errors.story : undefined} />
          <span id="story-count" className="share-field__count">{data.story.length} / 4000</span>
        </div>
      </div>

      {/* Category + Year side by side */}
      <div className="share-row">
        <div className={`share-field${errors.category && touched.category ? ' share-field--error' : ''}`}>
          <label className="share-field__label" htmlFor="story-category">
            Category <span className="share-field__required" aria-label="required">✦</span>
          </label>
          <div className="share-field__select-wrap">
            <select
              id="story-category"
              className="share-field__select"
              value={data.category}
              onChange={set('category')}
              onBlur={blur('category')}
              aria-invalid={!!errors.category}
            >
              <option value="">Choose one…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Icon name="arrow-down" size={14} />
          </div>
          <FieldError message={touched.category ? errors.category : undefined} />
        </div>

        <div className="share-field">
          <label className="share-field__label" htmlFor="story-year">Year (optional)</label>
          <input
            id="story-year"
            className="share-field__input"
            type="text"
            placeholder="e.g. 1978"
            value={data.year}
            maxLength={4}
            onChange={set('year')}
          />
        </div>
      </div>

      {/* Place + Name side by side */}
      <div className="share-row">
        <div className="share-field">
          <label className="share-field__label" htmlFor="story-place">Place (optional)</label>
          <input
            id="story-place"
            className="share-field__input"
            type="text"
            placeholder="e.g. Kyoto, Japan"
            value={data.place}
            maxLength={80}
            onChange={set('place')}
          />
        </div>

        <div className="share-field">
          <label className="share-field__label" htmlFor="story-name">Your name (optional)</label>
          <input
            id="story-name"
            className="share-field__input"
            type="text"
            placeholder="How you'd like to be credited"
            value={data.name}
            maxLength={80}
            onChange={set('name')}
          />
        </div>
      </div>

      {/* Consent */}
      <div className={`share-field share-field--consent${errors.consent && touched.consent ? ' share-field--error' : ''}`}>
        <label className="share-consent" htmlFor="story-consent">
          <input
            id="story-consent"
            type="checkbox"
            className="share-consent__checkbox"
            checked={data.consent}
            onChange={set('consent')}
            onBlur={blur('consent')}
            aria-invalid={!!errors.consent}
          />
          <span className="share-consent__box" aria-hidden="true" />
          <span className="share-consent__label">
            I'm happy for this story to be preserved in the Project Timeless archive and shared with future generations.
          </span>
        </label>
        <FieldError message={touched.consent ? errors.consent : undefined} />
      </div>

      {/* Actions */}
      <div className="share-form__actions">
        <p className="share-form__note">
          <Icon name="spark" size={12} /> Foundation preview — nothing is submitted to a server yet. Your story will be part of the first archive batch.
        </p>
        <button className="button button--primary" type="submit">
          Review &amp; preserve <Icon name="arrow-up-right" size={16} />
        </button>
      </div>

    </form>
  )
}
