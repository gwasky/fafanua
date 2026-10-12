// Static assets are served before this Worker runs, so it only sees
// requests that match no file in the build: the homepage, the landing
// pages (/services/<slug>, /solutions/<slug>) and every other asset are
// files. It answers each with the pre-rendered not-found page (404.html,
// served by the assets binding at /404) and a 404 status, so a missing
// page is never a soft 404 (#67). If the page itself is missing, it falls
// back to plain text.
export default {
  async fetch(request, env): Promise<Response> {
    // A future API route would go here, for example:
    // const url = new URL(request.url)
    // if (url.pathname.startsWith('/api/')) {
    //   return handleApi(request, env)
    // }

    const page = await env.ASSETS.fetch(new URL('/404', request.url))
    if (page.ok) {
      return new Response(request.method === 'HEAD' ? null : page.body, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      })
    }

    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  },
} satisfies ExportedHandler<Env>
