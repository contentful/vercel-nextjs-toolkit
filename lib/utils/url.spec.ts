import { describe, expect, it } from 'vitest';
import { buildRedirectUrl, parseNextApiRequest, parseRequestUrl } from './url';
import { makeNextApiRequest } from '../../test/helpers';

const requestUrl = `https://my.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat&x-vercel-protection-bypass=foo&x-contentful-preview-secret=bar`;

describe('parseNextApiRequest', () => {
  const request = makeNextApiRequest(requestUrl);

  it('returns correct parsed values', () => {
    const result = parseNextApiRequest(request)
    expect(result).toHaveProperty('origin', 'https://my.vercel.app')
    expect(result).toHaveProperty('host', 'my.vercel.app')
    expect(result).toHaveProperty('bypassToken', 'foo')
    expect(result).toHaveProperty('contentfulPreviewSecret', 'bar')
    expect(result).toHaveProperty('path', '/blogs/my-cat')
  })
})

describe('parseRequestUrl', () => {
  it('returns correct parsed values', () => {
    const result = parseRequestUrl(requestUrl)
    expect(result).toHaveProperty('origin', 'https://my.vercel.app')
    expect(result).toHaveProperty('host', 'my.vercel.app')
    expect(result).toHaveProperty('bypassToken', 'foo')
    expect(result).toHaveProperty('path', '/blogs/my-cat')
  })
})

describe('buildRedirectUrl', () => {
  const path = '/blogs/my-cat'
  const base = 'https://my.vercel.app'
  const bypassTokenFromQuery = 'bypass-token-from-query'

  it('returns correct redirect URL', () => {
    const result = buildRedirectUrl({path, base, bypassTokenFromQuery})
    expect(result).toEqual('https://my.vercel.app/blogs/my-cat?x-vercel-protection-bypass=bypass-token-from-query&x-vercel-set-bypass-cookie=samesitenone')
  })
})
