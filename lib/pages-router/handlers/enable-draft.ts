import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { buildRedirectUrl, parseNextApiRequest } from '../../utils/url';
import { parseVercelJwtCookie } from '../../utils/vercelJwt';
import { type VercelJwt } from '../../types';

export const enableDraftHandler: NextApiHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> => {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
  } = parseNextApiRequest(request);

  // if we're in development, we don't need to check for a bypass token, and we can just enable draft mode
  if (process.env.NODE_ENV === 'development') {
    response.setDraftMode({ enable: true })
    const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery });
    response.redirect(redirectUrl)
    return
  }

  const vercelJwtCookie = request.cookies['_vercel_jwt']
  let bypassToken: string;
  let aud: string;

  if (bypassTokenFromQuery) {
    bypassToken = bypassTokenFromQuery;
    aud = host;
  } else {
    // if x-vercel-protection-bypass not provided in query, we defer to parsing the _vercel_jwt cookie
    // which bundlees the bypass token value in its payload
    let vercelJwt: VercelJwt;
    try {
      if (!vercelJwtCookie) {
        response.status(401).send(
          'Missing _vercel_jwt cookie required for authorization bypass'
        )
        return
      }
      vercelJwt = parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      response.status(401).send(
        'Malformed bypass authorization token in _vercel_jwt cookie'
      )
      return
    }
    bypassToken = vercelJwt.bypass;
    aud = vercelJwt.aud;
  }

  if (bypassToken !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    response.status(403).send(
      'The bypass token you are authorized with does not match the bypass secret for this deployment. You might need to redeploy or go back and try the link again.'
    )
    return
  }

  if (aud !== host) {
    response.status(403).send(
      `The bypass token you are authorized with is not valid for this host (${host}). You might need to redeploy or go back and try the link again.`,
    )
    return
  }

  if (!path) {
    response.status(400).send(
      'Missing required value for query parameter `path`'
    )
    return
  }

  response.setDraftMode({ enable: true })

  // if a _vercel_jwt cookie was found, we do _not_ want to pass through the bypassToken to the redirect query. this
  // is because Vercel will not "process" (and remove) the query parameter when a _vercel_jwt cookie is present.
  const bypassTokenForRedirect = vercelJwtCookie ? undefined : bypassTokenFromQuery

  const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery: bypassTokenForRedirect });
  response.redirect(redirectUrl)
  return
}
