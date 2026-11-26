function jsonError(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export async function onRequest(context) {
  const apiOrigin = context.env.API_ORIGIN
  if (!apiOrigin) return jsonError('API_ORIGIN is not configured')

  const url = new URL(context.request.url)
  const target = `${apiOrigin.replace(/\/+$/, '')}${url.pathname}${url.search}`
  const headers = new Headers()
  const contentType = context.request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  const response = await fetch(target, {
    method: context.request.method,
    headers,
    body: context.request.body,
    redirect: 'manual',
  })
  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('cache-control', 'no-store')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}
