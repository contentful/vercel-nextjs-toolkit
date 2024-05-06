import { NextRequest } from "next/server";
import { type VercelJwt } from "../types";

export const getVercelJwtCookie = (request: NextRequest): string => {
  const vercelJwtCookie = request.cookies.get('_vercel_jwt');
  if (!vercelJwtCookie) throw new Error('`_vercel_jwt` cookie not set');
  return vercelJwtCookie.value;
}

export const parseVercelJwtCookie = (vercelJwtCookie: string): VercelJwt => {
  const base64Payload = vercelJwtCookie.split('.')[1];
  if (!base64Payload) throw new Error('Malformed `_vercel_jwt` cookie value');

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
