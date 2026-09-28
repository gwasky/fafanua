// @vitest-environment node
import { describe, expect, it } from 'vitest'
import worker from './index'

describe('worker', () => {
  it('returns 404 for a request that matches no asset', async () => {
    // Call the handler with the same arguments the Workers runtime passes.
    const fetch: ExportedHandlerFetchHandler<Env> = worker.fetch
    const request = new Request<unknown, IncomingRequestCfProperties>(
      'https://fafanua.tech/does-not-exist',
    )
    const response = await fetch(request, {} as Env, {} as ExecutionContext)

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Not Found')
  })
})
