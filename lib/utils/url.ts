import { NextApiRequest } from "next";

interface ParsedRequestUrl {
  origin: string;
  host: string;
  path: string;
  bypassToken: string;
}

export const parseNextApiRequest = (
  request: NextApiRequest
): ParsedRequestUrl => {
  const hostHeader = request.headers.host
  if (!hostHeader) throw new Error('missing `host` header from request')

  const protocol = request.headers['x-forwarded-proto'] || 'https'
  const requestUrl = request.url && new URL(request.url, `${protocol}://${hostHeader}`).toString()

  const { origin, path, host, bypassToken } = parseRequestUrl(requestUrl)
  return { origin, path, host, bypassToken };
}

export const parseRequestUrl = (
  requestUrl: string | undefined,
): ParsedRequestUrl => {
  if (!requestUrl) throw new Error('missing `url` value in request')
  const { searchParams, origin, host } = new URL(requestUrl);

  const rawPath = searchParams.get('path') || '';
  const bypassToken = searchParams.get('x-vercel-protection-bypass') || '';

  // to allow query parameters to be passed through to the redirected URL, the original `path` should already be
  // URI encoded, and thus must be decoded here
  const path = decodeURIComponent(rawPath);

  return { origin, path, host, bypassToken };
};

export const buildRedirectUrl = ({
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

