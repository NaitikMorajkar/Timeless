import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAskArchive, handleHealth } from './server/handler.mjs'

type ApiMiddleware = (request: IncomingMessage, response: ServerResponse, next?: () => void) => unknown
type MiddlewareHost = { middlewares: { use: (path: string, handler: ApiMiddleware) => void } }

const apiPlugin = () => ({
  name: 'timeless-ask-archive-api',
  configureServer(server: MiddlewareHost) {
    server.middlewares.use('/api/ask-archive', handleAskArchive)
    server.middlewares.use('/api/health', handleHealth)
  },
  configurePreviewServer(server: MiddlewareHost) {
    server.middlewares.use('/api/ask-archive', handleAskArchive)
    server.middlewares.use('/api/health', handleHealth)
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
  return {
    plugins: [react(), apiPlugin()],
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: ['.manus.computer', 'localhost', '127.0.0.1'],
    },
  }
})
