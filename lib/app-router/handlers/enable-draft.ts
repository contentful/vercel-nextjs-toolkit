import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { buildRedirectUrl, parseRequestUrl } from '../../utils/url';
import { getVercelJwtCookie, parseVercelJwtCookie, type VercelJwt } from '../../utils/vercelJwt';

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
      const vercelJwtCookie = getVercelJwtCookie(request)
      vercelJwt = parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      return new Response(
        'Missing or malformed bypass authorization token in _vercel_jwt cookie',
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

  const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery });
  redirect(redirectUrl);
}
