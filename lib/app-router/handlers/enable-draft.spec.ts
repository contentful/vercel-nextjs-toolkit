import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { enableDraftHandler as GET } from './enable-draft';
import { draftMode } from 'next/headers';

vi.mock('next/navigation', () => {
  return {
    redirect: vi.fn(),
  };
});

vi.mock('next/headers', () => {
  return {
    draftMode: vi.fn(),
  };
});

describe('handler', () => {
  const bypassToken = 'kByQez2ke5Jl4ulCY6kxQrpFMp1UIohs';
  const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;

  // based on a real vercel token
  const vercelJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJieXBhc3MiOiJrQnlRZXoya2U1Smw0dWxDWTZreFFycEZNcDFVSW9ocyIsImF1ZCI6InZlcmNlbC1hcHAtcm91dGVyLWludGVncmF0aW9ucy1sbDl1eHdiNGYudmVyY2VsLmFwcCIsImlhdCI6MTcxMzgwOTE2Nywic3ViIjoicHJvdGVjdGlvbi1ieXBhc3MtYXV0b21hdGlvbiJ9.ktyaHnYQXj-3dDnEn0ZVYkwpnQt1gc2sZ6qrgg3GIOs';
  let request: NextRequest = new NextRequest(url);
  request.cookies.set('_vercel_jwt', vercelJwt);

  let draftModeMock: ReturnType<typeof draftMode>

  beforeEach(() => {
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', bypassToken);
    draftModeMock = Promise.resolve({
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: true
    })
    vi.mocked(draftMode).mockReturnValue(draftModeMock)
  });

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('redirects safely to the provided path, without passing through the token and bypass cookie query params', async () => {
    const result = await GET(request);
    expect(result).to.be.undefined;
    expect((await draftModeMock).enable).toHaveBeenCalled();
    expect(vi.mocked(redirect)).toHaveBeenCalledWith(
      'https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/blogs/my-cat',
    );
  });

  describe('when the path is missing', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft`;
      request = new NextRequest(url);
      request.cookies.set('_vercel_jwt', vercelJwt);
    });

    it('returns a response with status 400', async () => {
      const result = await GET(request);
      expect(result).toHaveProperty('status', 400);
    });
  });

  describe('when aud in token mismatches domain of request', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-foobar.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
      request = new NextRequest(url);
      request.cookies.set('_vercel_jwt', vercelJwt);
    });

    it('returns a response with status 403', async () => {
      const result = await GET(request);
      expect(result).toHaveProperty('status', 403);
    });
  });

  describe('when a x-vercel-protection-bypass token is also provided as a query param', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat&x-vercel-protection-bypass=${bypassToken}`;
      request = new NextRequest(url);
      request.cookies.set('_vercel_jwt', vercelJwt);
    });

    it('redirects safely to the provided path and DOES NOT pass through the token and bypass cookie query params', async () => {
      const result = await GET(request);
      expect(result).to.be.undefined;
      expect((await draftModeMock).enable).toHaveBeenCalled();
      expect(vi.mocked(redirect)).toHaveBeenCalledWith(
        `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/blogs/my-cat`,
      );
    });
  });

  describe('when the _vercel_jwt cookie is missing', () => {
    beforeEach(() => {
      const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat`;
      request = new NextRequest(url);
    });

    it('returns a response with status 401', async () => {
      const result = await GET(request);
      expect(result).toHaveProperty('status', 401);
    });

    describe('when a x-contentful-preview-secret is provided as a query param', () => {
      beforeEach(() => {
        vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', '');
        vi.stubEnv('CONTENTFUL_PREVIEW_SECRET', bypassToken);
        const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat&x-contentful-preview-secret=${bypassToken}`;
        request = new NextRequest(url);
      });

      it('redirects safely to the provided path and DOES NOT pass through the token and bypass cookie query params', async () => {
        const result = await GET(request);
        expect(result).to.be.undefined;
        expect((await draftModeMock).enable).toHaveBeenCalled();
        expect(vi.mocked(redirect)).toHaveBeenCalledWith(
          `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/blogs/my-cat`,
        );
      });
    });

    describe('when a x-vercel-protection-bypass token is provided as a query param', () => {
      beforeEach(() => {
        const url = `https://vercel-app-router-integrations-ll9uxwb4f.vercel.app/api/enable-draft?path=%2Fblogs%2Fmy-cat&x-vercel-protection-bypass=${bypassToken}`;
        request = new NextRequest(url);
      });

      it('redirects safely to the provided path AND passes through the token and bypass cookie query params', async () => {
        const result = await GET(request);
        expect(result).to.be.undefined;
        expect((await draftModeMock).enable).toHaveBeenCalled();
        expect(vi.mocked(redirect)).toHaveBeenCalledWith(
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
      request = new NextRequest(url);
      request.cookies.set('_vercel_jwt', tokenWithBadBypass);
    });

    it('returns a response with status 403', async () => {
      const result = await GET(request);
      expect(result).toHaveProperty('status', 403);
    });
  });
});
