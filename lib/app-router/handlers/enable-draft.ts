import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { buildRedirectUrl, parseRequestUrl } from '../../utils/url';
import { getVercelJwtCookie, parseVercelJwtCookie } from '../../utils/vercelJwt';
import { type VercelJwt } from '../../types';

export async function enableDraftHandler(
  request: NextRequest,
): Promise<Response | void> {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
  } = parseRequestUrl(request.url);

  // if we're in development, we don't need to check for a bypass token, and we can just enable draft mode
  if (process.env.NODE_ENV === 'development') {
    draftMode().enable();
    const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery });
    return redirect(redirectUrl);
  }

  const vercelJwtCookie = getVercelJwtCookie(request)

  let bypassToken: string;
  let aud: string;
  let vercelJwt: VercelJwt | null = null

  if (bypassTokenFromQuery) {
    bypassToken = bypassTokenFromQuery;
    aud = host;
  } else {
    // if we don't have a bypass token from the query we fall back to the _vercel_jwt cookie to find
    // the correct authorization bypass elements
    if (!vercelJwtCookie) {
      return new Response(
        'Missing _vercel_jwt cookie required for authorization bypass',
        { status: 401 },
      );
    }
    try {
      vercelJwt = parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      return new Response(
        'Malformed bypass authorization token in _vercel_jwt cookie',
        { status: 401 },
      );
    }
    bypassToken = vercelJwt.bypass;
    aud = vercelJwt.aud;
  }

  if (bypassToken !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    return new Response(
      'The bypass token you are authorized with does not match the bypass secret for this deployment. You might need to redeploy or go back and try the link again.',
      { status: 403 },
    );
  }

  if (aud !== host) {
    return new Response(
      `The bypass token you are authorized with is not valid for this host (${host}). You might need to redeploy or go back and try the link again.`,
      { status: 403 },
    );
  }

  if (!path) {
    return new Response('Missing required value for query parameter `path`', {
      status: 400,
    });
  }

  draftMode().enable();

  // if a _vercel_jwt cookie was found, we do _not_ want to pass through the bypassToken to the redirect query. this
  // is because Vercel will not "process" (and remove) the query parameter when a _vercel_jwt cookie is present.
  const bypassTokenForRedirect = vercelJwtCookie ? undefined : bypassTokenFromQuery

  const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery: bypassTokenForRedirect });
  redirect(redirectUrl);
}
