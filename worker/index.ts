// Static assets are served before this Worker runs, so it only sees
// requests that match no file in the build.
export default {
  async fetch(): Promise<Response> {
    // A future API route would go here. Take `request` and `env` as
    // parameters, then for example:
    // const url = new URL(request.url)
    // if (url.pathname.startsWith('/api/')) {
    //   return handleApi(request, env)
    // }

    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  },
} satisfies ExportedHandler<Env>
