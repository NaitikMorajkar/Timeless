import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleAskArchive, handleHealth } from './handler.mjs'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distRoot = resolve(projectRoot, 'dist')
const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

function sendText(response, status, message) {
  response.statusCode = status
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end(message)
}

function serveFile(response, filePath, method) {
  const contentType = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream'
  const stats = statSync(filePath)
  response.statusCode = 200
  response.setHeader('Content-Type', contentType)
  response.setHeader('Content-Length', stats.size)
  response.setHeader('Cache-Control', filePath.includes(`${join('dist', 'assets')}${'/'}`) ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate')
  if (method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(filePath).on('error', () => {
    if (!response.headersSent) sendText(response, 500, 'Unable to read asset')
    else response.destroy()
  }).pipe(response)
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const pathname = decodeURIComponent(requestUrl.pathname)
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const candidate = resolve(distRoot, relativePath)
  const insideDist = candidate === distRoot || candidate.startsWith(`${distRoot}/`)

  if (!insideDist) {
    sendText(response, 400, 'Bad request')
    return
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    serveFile(response, candidate, request.method)
    return
  }

  if (request.method === 'GET') {
    const spaEntry = join(distRoot, 'index.html')
    if (existsSync(spaEntry)) {
      serveFile(response, spaEntry, request.method)
      return
    }
  }

  sendText(response, 404, 'Not found')
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname
  if (pathname === '/api/ask-archive') {
    await handleAskArchive(request, response)
    return
  }
  if (pathname === '/api/health') {
    handleHealth(request, response)
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed')
    return
  }
  serveStatic(request, response)
})

server.listen(port, host, () => {
  console.log(`Project Timeless server listening on ${host}:${port}`)
})
