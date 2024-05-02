import { MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import { enableDraftApiHandler as handler } from './enable-draft';

vi.mock('next/navigation', () => {
  return {
    redirect: vi.fn(),
  };
});

vi.mock('next/headers', () => {
  return {
    draftMode: vi.fn(() => draftModeMock),
  };
});

const draftModeMock = {
  enable: vi.fn(),
};

const makeNextApiRequest = (url: string): NextApiRequest => ({
  url: url,
  cookies: {}
} as NextApiRequest)

const makeNextApiResponse = (): NextApiResponse => (nextApiResponseMock as NextApiResponse)

const nextApiResponseMock: Partial<NextApiResponse> = {
  status(_code: number) { return this as NextApiResponse },
  send(_bodyString: string) { },
  redirect(_statusCode: number | string, _url?: string) { return this as NextApiResponse }
}

interface ApiResponseSpy {
  status: MockInstance
  send: MockInstance
  redirect: MockInstance
}


describe('handler', () => {
  const bypassToken = 'kByQez2ke5Jl4ulCY6kxQrpFMp1UIohs';
  const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
  const response = makeNextApiResponse()

  // based on a real vercel token
  const vercelJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJieXBhc3MiOiJrQnlRZXoya2U1Smw0dWxDWTZreFFycEZNcDFVSW9ocyIsImF1ZCI6InZlcmNlbC1hcHAtcm91dGVyLWludGVncmF0aW9ucy1sbDl1eHdiNGYudmVyY2VsLmFwcCIsImlhdCI6MTcxMzgwOTE2Nywic3ViIjoicHJvdGVjdGlvbi1ieXBhc3MtYXV0b21hdGlvbiJ9.ktyaHnYQXj-3dDnEn0ZVYkwpnQt1gc2sZ6qrgg3GIOs';
  let request: NextApiRequest = makeNextApiRequest(url);
  let apiResponseSpy: ApiResponseSpy
  request.cookies['_vercel_jwt'] = vercelJwt;

  beforeEach(() => {
    apiResponseSpy = {
      redirect: vi.spyOn(nextApiResponseMock, 'redirect'),
      status: vi.spyOn(nextApiResponseMock, 'status'),
      send: vi.spyOn(nextApiResponseMock, 'send')
    }
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', bypassToken);
  });

  it('redirects safely to the provided path, without passing through the token and bypass cookie query params', async () => {
    const result = await handler(request, response);
    expect(result).to.be.undefined;
    expect(draftModeMock.enable).toHaveBeenCalled();
    expect(apiResponseSpy.redirect).toHaveBeenCalledWith(
      'https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/blogs/my-cat',
    );
  });

  describe('when the path is missing', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft`;
      request = makeNextApiRequest(url);
      request.cookies['_vercel_jwt'] = vercelJwt;
    });

    it('returns a response with status 400', async () => {
      await handler(request, response);
      expect(apiResponseSpy.status).toHaveBeenCalledWith(400);
      expect(apiResponseSpy.send).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('when aud in token mismatches domain of request', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-foobar.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
      request = makeNextApiRequest(url);
      request.cookies['_vercel_jwt'] = vercelJwt;
    });

    it('returns a response with status 403', async () => {
      await handler(request, response);
      expect(apiResponseSpy.status).toHaveBeenCalledWith(403);
      expect(apiResponseSpy.send).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('when the _vercel_jwt cookie is missing', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
      request = makeNextApiRequest(url);
    });

    it('returns a response with status 401', async () => {
      await handler(request, response);
      expect(apiResponseSpy.status).toHaveBeenCalledWith(401);
      expect(apiResponseSpy.send).toHaveBeenCalledWith(expect.any(String));
    });

    describe('when a x-vercel-protection-bypass token is provided as a query param', () => {
      beforeEach(() => {
        const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat&x-vercel-protection-bypass=${bypassToken}`;
        request = makeNextApiRequest(url);
      });

      it('redirects safely to the provided path AND passes through the token and bypass cookie query params', async () => {
        const result = await handler(request, response);
        expect(result).to.be.undefined;
        expect(draftModeMock.enable).toHaveBeenCalled();
        expect(apiResponseSpy.redirect).toHaveBeenCalledWith(
          `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/blogs/my-cat?x-vercel-protection-bypass=${bypassToken}&x-vercel-set-bypass-cookie=samesitenone`,
        );
      });
    });
  });

  describe('when the bypass token is wrong', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
      const tokenWithBadBypass =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJieXBhc3MiOiJiYWQtYnlwYXNzLXRva2VuIiwiYXVkIjoidmVyY2VsLWFwcC1yb3V0ZXItaW50ZWdyYXRpb25zLWxsOXV4d2I0Zi52ZXJjZWwuYXBwIiwiaWF0IjoxNzEzODA5MTY3LCJzdWIiOiJwcm90ZWN0aW9uLWJ5cGFzcy1hdXRvbWF0aW9uIn0=.ktyaHnYQXj-3dDnEn0ZVYkwpnQt1gc2sZ6qrgg3GIOs';
      request = makeNextApiRequest(url);
      request.cookies['_vercel_jwt'] = tokenWithBadBypass;
    });

    it('returns a response with status 403', async () => {
      await handler(request, response);
      expect(apiResponseSpy.status).toHaveBeenCalledWith(403);
      expect(apiResponseSpy.send).toHaveBeenCalledWith(expect.any(String));
    });
  });
});

