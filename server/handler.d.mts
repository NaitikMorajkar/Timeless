import type { IncomingMessage, ServerResponse } from 'node:http'

export declare function handleAskArchive(request: IncomingMessage, response: ServerResponse): Promise<void>
export declare function handleHealth(request: IncomingMessage, response: ServerResponse): void
export declare const askArchiveModel: string
