// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import worker from './index'

// Calls the handler with the same arguments the Workers runtime passes,
// and an assets binding that answers /404 with `page`.
async function call(page: Response, method = 'GET') {
  const fetch: ExportedHandlerFetchHandler<Env> = worker.fetch
  const assets = vi.fn(async () => page)
  const request = new Request<unknown, IncomingRequestCfProperties>(
    'https://fafanua.tech/does-not-exist',
    { method },
  )
  const response = await fetch(
    request,
    { ASSETS: { fetch: assets } } as unknown as Env,
    {} as ExecutionContext,
  )
  return { response, assets }
}

describe('worker', () => {
  it('serves the pre-rendered not-found page with a 404 status (#67)', async () => {
    const { response, assets } = await call(new Response('<h1>Page not found</h1>'))

    expect(response.status).toBe(404)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await response.text()).toBe('<h1>Page not found</h1>')
    expect(String((assets.mock.calls[0] as unknown[])[0])).toBe('https://fafanua.tech/404')
  })

  it('sends no body for a HEAD request', async () => {
    const { response } = await call(new Response('<h1>Page not found</h1>'), 'HEAD')

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
  })

  it('falls back to plain text if the page is missing', async () => {
    const { response } = await call(new Response('', { status: 404 }))

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Not Found')
  })
})
