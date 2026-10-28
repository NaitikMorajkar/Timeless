import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from './Icon'

type AskArchiveResponse = {
  answer?: string
  error?: string
  model?: string
  source?: 'general-ai'
  groundedInArchive?: boolean
}

type RequestState = 'idle' | 'loading' | 'success' | 'error'

const MIN_QUESTION_LENGTH = 8
const MAX_QUESTION_LENGTH = 800

export function AskArchivePanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<AskArchiveResponse | null>(null)
  const [state, setState] = useState<RequestState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (trimmedQuestion.length < MIN_QUESTION_LENGTH) {
      setState('error')
      setErrorMessage('Please ask a little more so the archive has enough context to respond.')
      return
    }
    if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
      setState('error')
      setErrorMessage('Please keep your question under 800 characters.')
      return
    }

    setState('loading')
    setErrorMessage('')
    setAnswer(null)
    try {
      const response = await fetch('/api/ask-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion }),
      })
      const payload = await response.json() as AskArchiveResponse
      if (!response.ok) throw new Error(payload.error || 'Ask the Archive is temporarily unavailable.')
      setAnswer(payload)
      setState('success')
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Ask the Archive is temporarily unavailable.')
    }
  }

  const isLoading = state === 'loading'
  return (
    <div className="ask-panel">
      <div className="ask-panel__intro">
        <span className="ask-panel__label">Ask a question</span>
        <span className="ask-panel__count">{question.length}/{MAX_QUESTION_LENGTH}</span>
      </div>
      <form onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor="archive-question">Your question for the archive</label>
        <textarea
          id="archive-question"
          value={question}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="What can a tradition teach us about caring for one another?"
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isLoading}
          aria-describedby="archive-answer-note"
        />
        <div className="ask-panel__footer">
          <p id="archive-answer-note">General AI guidance for now. Answers are not grounded in verified archived stories.</p>
          <button className="button button--primary button--small" type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking…' : 'Ask the Archive'} <Icon name="arrow-up-right" size={15} />
          </button>
        </div>
      </form>
      {state === 'error' && <div className="ask-panel__message ask-panel__message--error" role="alert">{errorMessage}</div>}
      {state === 'success' && answer?.answer && (
        <div className="ask-panel__answer" role="status" aria-live="polite">
          <div className="ask-panel__answer-meta"><span>General AI answer</span><span>Not grounded in archived stories</span></div>
          <p>{answer.answer}</p>
          {answer.model && <small>Model · {answer.model}</small>}
        </div>
      )}
    </div>
  )
}
