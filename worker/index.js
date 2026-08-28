const encoder = new TextEncoder()

function constantTimeEqual(leftValue, rightValue) {
  const left = encoder.encode(leftValue)
  const right = encoder.encode(rightValue)
  const length = Math.max(left.length, right.length)
  let mismatch = left.length ^ right.length

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }

  return mismatch === 0
}

function parseBasicCredentials(header) {
  if (!header?.startsWith('Basic ')) return null

  try {
    const decoded = atob(header.slice(6))
    const separator = decoded.indexOf(':')

    if (separator < 0) return null

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'WWW-Authenticate': 'Basic realm="Mega 5G preview", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

export default {
  async fetch(request, env) {
    if (!env.PREVIEW_USER || !env.PREVIEW_PASSWORD) {
      return new Response('Preview credentials are not configured', {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      })
    }

    const credentials = parseBasicCredentials(request.headers.get('Authorization'))
    const isAuthorized =
      credentials &&
      constantTimeEqual(credentials.username, env.PREVIEW_USER) &&
      constantTimeEqual(credentials.password, env.PREVIEW_PASSWORD)

    if (!isAuthorized) return unauthorized()

    const assetResponse = await env.ASSETS.fetch(request)
    const headers = new Headers(assetResponse.headers)
    const contentType = headers.get('Content-Type') ?? ''

    headers.set('Referrer-Policy', 'no-referrer')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')

    if (contentType.includes('text/html')) {
      headers.set('Cache-Control', 'private, no-store')
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    })
  },
}
