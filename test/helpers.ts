import { NextApiRequest } from "next"

export const makeNextApiRequest = (url: string): NextApiRequest => {
  // need to recreate a realistic NextApiRequest which includes the values
  // we'll use when parsing the URL in production code
  const { protocol, host } = new URL(url)
  const path = '/' + url.split('/').slice(3).join('/')
  const request = {
    url: path,
    cookies: {},
    headers: {
      host,
      'x-forwarded-proto': protocol.slice(0, -1)
    }
  } as unknown as NextApiRequest
  return request
}
