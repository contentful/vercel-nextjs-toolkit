import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import { enableDraftHandler as handler } from './pages-router';

describe('handler', () => {
  const bypassToken = 'bypass-token';

  //   const url = `https://foo.vercel.app/api/enable-draft?x-vercel-protection-bypass=${bypassToken}&path=%2Fblogs%2Fmy-cat`;

  beforeEach(() => {
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', bypassToken);
  });

  it('redirects safely to the provided path, passing through the token and bypass cookie query params', async () => {
    const mockReq = {
      query: {
        path: '/blogs/test-slug',
        bypass: bypassToken,
      },
    } as unknown as NextApiRequest;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setDraftMode: vi.fn(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as NextApiResponse;

    const result = await handler(mockReq, mockRes);

    expect(result).to.be.undefined;
    expect(mockRes.status).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(307);
    expect(mockRes.setDraftMode).toHaveBeenCalled();
    expect(mockRes.setDraftMode).toHaveBeenCalledTimes(1);
    expect(mockRes.setDraftMode).toHaveBeenCalledWith({ enable: true });
    expect(mockRes.setHeader).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledTimes(1);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Location',
      '/blogs/test-slug?x-vercel-bypass-token=bypass-token&x-vercel-set-bypass-cookie=samesitenone',
    );
    expect(mockRes.end).toHaveBeenCalledTimes(1);
  });
});
