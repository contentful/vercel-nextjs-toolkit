import { beforeEach, describe, expect, it } from 'vitest';
import { getVercelJwtCookie, parseVercelJwtCookie } from './vercelJwt';
import { NextRequest } from 'next/server';

describe('getVercelJwtCookie', () => {
  const url = 'http://example.com'
  let request: NextRequest

  beforeEach(() => {
    request = new NextRequest(url);
    request.cookies.set('_vercel_jwt', 'vercel-jwt');
  })

  it('returns the _vercel_jwt cookie', () => {
    const result = getVercelJwtCookie(request)
    expect(result).toEqual('vercel-jwt')
  })

  describe('when cookie is not present', () => {
    beforeEach(() => {
      request = new NextRequest(url);
      request.cookies.clear()
    })

    it('returns undefined', () => {
      const result = getVercelJwtCookie(request)
      expect(result).to.equal(undefined)
    })
  })
})

describe('parseVercelJwtCookie', () => {
  const vercelJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJieXBhc3MiOiJrQnlRZXoya2U1Smw0dWxDWTZreFFycEZNcDFVSW9ocyIsImF1ZCI6InZlcmNlbC1hcHAtcm91dGVyLWludGVncmF0aW9ucy1sbDl1eHdiNGYudmVyY2VsLmFwcCIsImlhdCI6MTcxMzgwOTE2Nywic3ViIjoicHJvdGVjdGlvbi1ieXBhc3MtYXV0b21hdGlvbiJ9.ktyaHnYQXj-3dDnEn0ZVYkwpnQt1gc2sZ6qrgg3GIOs';

  it('returns the _vercel_jwt cookie', () => {
    const result = parseVercelJwtCookie(vercelJwt)
    expect(result).toHaveProperty('aud', 'vercel-app-router-integrations-ll9uxwb4f.vercel.app')
    expect(result).toHaveProperty('bypass', 'kByQez2ke5Jl4ulCY6kxQrpFMp1UIohs')
    expect(result).toHaveProperty('iat', 1713809167)
    expect(result).toHaveProperty('sub', 'protection-bypass-automation')
  })
})
