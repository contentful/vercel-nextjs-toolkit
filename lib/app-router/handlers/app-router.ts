import type { NextApiRequest, NextApiResponse } from 'next';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { isNextApiRequest } from '../helpers/is-next-api-request';

type HandlerRequest = NextApiRequest | NextRequest | Request;

function enableDraftHandler(draftMode: any) {
  async function handler<HandlerReq extends NextApiRequest>(
    req: HandlerReq,
    res: NextApiResponse,
  ): Promise<unknown>;
  async function handler<HandlerReq extends NextRequest | Request>(
    req: HandlerReq,
    res?: undefined,
  ): Promise<Response | void>;
  async function handler(
    req: HandlerRequest,
    _: NextApiResponse | undefined,
  ): Promise<Response | void> {
    if (isNextApiRequest(req)) {
      const {
        origin: base,
        path,
        host,
        bypassToken: bypassTokenFromQuery,
      } = parseRequestUrl(req.url!);

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
          vercelJwt = parseVercelJwtCookie(req as unknown as NextRequest);
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
        return new Response(
          'Missing required value for query parameter `path`',
          {
            status: 400,
          },
        );
      }

      draftMode().enable();

      const redirectUrl = buildRedirectUrl({
        path,
        base,
        bypassTokenFromQuery,
      });
      redirect(redirectUrl);
    }
  }

  return handler;
}

export { enableDraftHandler };

interface VercelJwt {
  bypass: string;
  aud: string;
  iat: number;
  sub: string;
}

const parseVercelJwtCookie = (request: NextRequest): VercelJwt => {
  const vercelJwtCookie = request.cookies.get('_vercel_jwt');
  if (!vercelJwtCookie) throw new Error('`_vercel_jwt` cookie not set');

  const base64Payload = vercelJwtCookie.value.split('.')[1];
  if (!vercelJwtCookie) throw new Error('Malformed `_vercel_jwt` cookie value');

  const base64 = base64Payload.replace('-', '+').replace('_', '/');
  const payload = asciiBase64Decode(base64);
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
  requestUrl: string,
): {
  origin: string;
  host: string;
  path: string;
  bypassToken: string;
} => {
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

// simplified cross-platform universal base64decode that only supports ascii characters
// based on https://gist.github.com/Nijikokun/5192472
const asciiBase64Decode = (input: string): string => {
  const map =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const str = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  let output = '';
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  let e = 0;
  let f = 0;
  let g = 0;
  let i = 0;

  while (i < str.length) {
    d = map.indexOf(str.charAt(i++));
    e = map.indexOf(str.charAt(i++));
    f = map.indexOf(str.charAt(i++));
    g = map.indexOf(str.charAt(i++));

    a = (d << 2) | (e >> 4);
    b = ((e & 15) << 4) | (f >> 2);
    c = ((f & 3) << 6) | g;

    output += String.fromCharCode(a);
    if (f != 64) output += String.fromCharCode(b);
    if (g != 64) output += String.fromCharCode(c);
  }

  return asciiUtfDecode(output);
};

// simple cross-platform utf decoder with ascii support only
const asciiUtfDecode = (str: string): string => {
  let output = '';
  let i = 0;
  let charCode = 0;

  while (i < str.length) {
    charCode = str.charCodeAt(i);

    if (charCode < 128) {
      output += String.fromCharCode(charCode);
      i++;
    } else {
      throw new Error(
        'only ASCII characters supported in base64 encoded payload',
      );
    }
  }

  return output;
};
