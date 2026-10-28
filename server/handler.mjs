const API_BASE_URL = process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.nebius.com/v1'
const MODEL_ID = process.env.NEBIUS_MODEL_ID || 'nvidia/Nemotron-3-Nano-30B-A3B'
const MAX_BODY_BYTES = 12_000
const MAX_QUESTION_LENGTH = 800
const MIN_QUESTION_LENGTH = 8
const RATE_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT = 12
const rateBuckets = new Map()

function sendJson(response, status, body, headers = {}) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value))
  response.end(JSON.stringify(body))
}

function clientKey(request) {
  const forwarded = request.headers['x-forwarded-for']
  return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.socket.remoteAddress || 'unknown'
}

function isRateLimited(key) {
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT
}

async function readJson(request) {
  let size = 0
  let body = ''
  for await (const chunk of request) {
    size += Buffer.byteLength(chunk)
    if (size > MAX_BODY_BYTES) throw new Error('body_too_large')
    body += chunk
  }
  try {
    return JSON.parse(body || '{}')
  } catch {
    throw new Error('invalid_json')
  }
}

function extractAnswer(payload) {
  const message = payload?.choices?.[0]?.message
  const content = message?.content
  if (typeof content === 'string' && content.trim()) return content.trim()
  if (Array.isArray(content)) {
    const text = content.map((part) => typeof part === 'string' ? part : part?.text || '').join('').trim()
    if (text) return text
  }
  if (typeof message?.reasoning_content === 'string' && message.reasoning_content.trim()) {
    return message.reasoning_content.trim()
  }
  return ''
}

function archiveSystemPrompt() {
  return [
    'You are Ask the Archive, a thoughtful guide to human wisdom, cultural traditions, practical skills, and life lessons.',
    'Answer with warmth, humility, and useful context. Keep the answer concise but meaningful.',
    'This request is not connected to a verified story archive. Your answer is general AI-generated guidance only.',
    'Never invent archived stories, sources, people, locations, dates, quotations, citations, or personal experiences.',
    'If the user asks for an archived source, say clearly that this answer is not grounded in an archived story and do not fabricate one.',
    'Do not claim that you have searched, read, or retrieved Project Timeless archive records.',
  ].join(' ')
}

export async function handleAskArchive(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Use POST for Ask the Archive questions.' }, { Allow: 'POST' })
    return
  }

  if (isRateLimited(clientKey(request))) {
    sendJson(response, 429, { error: 'The archive is receiving many questions. Please try again in a few minutes.' }, { 'Retry-After': '60' })
    return
  }

  let payload
  try {
    payload = await readJson(request)
  } catch (error) {
    const message = error instanceof Error && error.message === 'body_too_large'
      ? 'That question is too long. Please keep it under 800 characters.'
      : 'Please send a valid question.'
    sendJson(response, 400, { error: message })
    return
  }

  const question = typeof payload.question === 'string' ? payload.question.trim() : ''
  if (question.length < MIN_QUESTION_LENGTH) {
    sendJson(response, 400, { error: 'Please ask a little more so the archive has enough context to respond.' })
    return
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    sendJson(response, 400, { error: 'That question is too long. Please keep it under 800 characters.' })
    return
  }

  const apiKey = process.env.NEBIUS_API_KEY
  if (!apiKey) {
    sendJson(response, 503, { error: 'Ask the Archive is temporarily unavailable because its server connection is not configured.' })
    return
  }

  const baseUrl = (process.env.NEBIUS_BASE_URL || API_BASE_URL).replace(/\/$/, '')
  const modelId = process.env.NEBIUS_MODEL_ID || MODEL_ID
  const isNvidia = baseUrl.includes('nvidia')
  const providerName = isNvidia ? 'NVIDIA' : 'Nebius'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  // Nemotron 3.5 is a hybrid reasoning model: by default it spends a long
  // "thinking" phase on reasoning tokens before answering (~14-27s observed).
  // Disabling that phase cut responses to roughly 1-6 seconds in testing.
  const requestBody = {
    model: modelId,
    temperature: 0.55,
    max_tokens: 1500,
    chat_template_kwargs: { enable_thinking: false },
    messages: [
      { role: 'system', content: archiveSystemPrompt() },
      { role: 'user', content: question },
    ],
  }

  try {
    let upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    // Some OpenAI-compatible providers reject unknown parameters with a 400;
    // retry once without the thinking control before surfacing an error.
    if (upstream.status === 400) {
      const fallbackBody = { ...requestBody }
      delete fallbackBody.chat_template_kwargs
      upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackBody),
        signal: controller.signal,
      })
    }

    if (!upstream.ok) {
      if (upstream.status === 401 || upstream.status === 403) {
        sendJson(response, 502, { error: `Ask the Archive could not authenticate with the ${providerName} model service. Please check your API key.` })
        return
      }
      if (upstream.status === 404) {
        sendJson(response, 502, { error: `${providerName} model service returned 404 (Model '${modelId}' not accessible on this account).` })
        return
      }
      if (upstream.status === 429) {
        sendJson(response, 503, { error: `The ${providerName} model service is busy. Please try again shortly.` })
        return
      }
      sendJson(response, 502, { error: `The ${providerName} model service could not answer right now. Please try again shortly.` })
      return
    }

    const result = await upstream.json()
    const answer = extractAnswer(result)
    if (!answer) {
      sendJson(response, 502, { error: 'The model returned an empty answer. Please try a different question.' })
      return
    }

    sendJson(response, 200, {
      answer,
      source: 'general-ai',
      groundedInArchive: false,
      model: modelId,
    })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'The archive took too long to respond. Please try again.'
      : 'Ask the Archive is temporarily unavailable. Please try again shortly.'
    sendJson(response, 503, { error: message })
  } finally {
    clearTimeout(timeout)
  }
}

export function handleHealth(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Use GET for health checks.' }, { Allow: 'GET' })
    return
  }
  sendJson(response, 200, { status: 'ok', service: 'project-timeless' })
}

export const askArchiveModel = MODEL_ID
