import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { draftMode } from 'next/headers';

export const enableDraftHandler: NextApiHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> => {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
  } = parseRequestUrl(request.url);

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
      vercelJwt = parseVercelJwtCookie(request);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      response.status(401).send(
        'Missing or malformed bypass authorization token in _vercel_jwt cookie'
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

  draftMode().enable();

  const redirectUrl = buildRedirectUrl({ path, base, bypassTokenFromQuery });
  response.redirect(redirectUrl)
  return
}

interface VercelJwt {
  bypass: string;
  aud: string;
  iat: number;
  sub: string;
}

const parseVercelJwtCookie = (request: NextApiRequest): VercelJwt => {
  const vercelJwtCookie = request.cookies['_vercel_jwt']
  if (!vercelJwtCookie) throw new Error('`_vercel_jwt` cookie not set');

  const base64Payload = vercelJwtCookie.split('.')[1];
  if (!vercelJwtCookie) throw new Error('Malformed `_vercel_jwt` cookie value');

  const base64 = base64Payload.replace('-', '+').replace('_', '/');
  const payload = atob(base64);
  const vercelJwt = JSON.parse(payload);

  assertVercelJwt(vercelJwt);

  return vercelJwt;
};

function assertVercelJwt(value: object): asserts value is VercelJwt {
  const vercelJwt = value as VercelJwt;
  if (typeof vercelJwt.bypass !== 'string')
    throw new TypeError("'bypass' property in VercelJwt is not a string");
  if (typeof vercelJwt.aud !== 'string')
    throw new TypeError("'aud' property in VercelJwt is not a string");
  if (typeof vercelJwt.sub !== 'string')
    throw new TypeError("'sub' property in VercelJwt is not a string");
  if (typeof vercelJwt.iat !== 'number')
    throw new TypeError("'iat' property in VercelJwt is not a number");
}

const parseRequestUrl = (
  requestUrl: string | undefined,
): {
  origin: string;
  host: string;
  path: string;
  bypassToken: string;
} => {
  if (!requestUrl) throw new Error('missing `url` value in request')
  const { searchParams, origin, host } = new URL(requestUrl);

  const rawPath = searchParams.get('path') || '';
  const bypassToken = searchParams.get('x-vercel-protection-bypass') || '';

  // to allow query parameters to be passed through to the redirected URL, the original `path` should already be
  // URI encoded, and thus must be decoded here
  const path = decodeURIComponent(rawPath);

  return { origin, path, host, bypassToken };
};

const buildRedirectUrl = ({
  path,
  base,
  bypassTokenFromQuery,
}: {
  path: string;
  base: string;
  bypassTokenFromQuery?: string;
}): string => {
  const redirectUrl = new URL(path, base);

  // if the bypass token is provided in the query, we assume Vercel has _not_ already set the actual
  // token that bypasses authentication. thus we provided it here, on the redirect
  if (bypassTokenFromQuery) {
    redirectUrl.searchParams.set(
      'x-vercel-protection-bypass',
      bypassTokenFromQuery,
    );
    redirectUrl.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone');
  }

  return redirectUrl.toString();
};
