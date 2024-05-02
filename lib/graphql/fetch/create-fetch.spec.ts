import { vi, afterEach, describe, expect, it, beforeEach, Mock } from 'vitest';
import { createFetch } from './create-fetch';

global.fetch = vi.fn();

describe('createFetch', () => {
  const spaceId = 'testSpaceId';
  const accessToken = 'testAccessToken';
  const previewToken = 'testPreviewToken';
  const request = {
    query: `#graphql
      {
        foo
      }
    `,
    variables: {
      var1: 'value1',
      var2: 'value2',
    },
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    (fetch as Mock).mockImplementationOnce(() => ({
      ok: true,
      json: vi.fn(() => new Promise((resolve) => resolve({}))),
    }));
  });

  it('should call fetch with correct arguments for regular request', async () => {
    const { fetchGraphQL } = createFetch({
      spaceId,
      accessToken,
      previewToken,
    });

    await fetchGraphQL(request.query, request.variables);

    expect(fetch).toHaveBeenCalledWith(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: request.query,
          variables: request.variables,
        }),
        cache: 'force-cache',
      },
    );
  });

  it('should call fetch with correct arguments for preview request', async () => {
    const { fetchGraphQL } = createFetch({
      spaceId,
      accessToken,
      previewToken,
    });

    await fetchGraphQL(request.query, request.variables, true);

    expect(fetch).toHaveBeenCalledWith(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${previewToken}`,
        },
        body: JSON.stringify({
          query: request.query,
          variables: request.variables,
        }),
        cache: 'no-store',
      },
    );
  });
});
