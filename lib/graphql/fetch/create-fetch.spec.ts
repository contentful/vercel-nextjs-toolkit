import { vi, afterEach, describe, expect, it, beforeEach, Mock } from 'vitest';
import { createFetch } from './create-fetch';

global.fetch = vi.fn();

describe('createFetch', () => {
  const spaceId = 'testSpaceId';
  const accessToken = 'testAccessToken';
  const previewToken = 'testPreviewToken';
  const graphqlEndpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

  const { fetchGraphQL } = createFetch({
    spaceId,
    accessToken,
    previewToken,
  });

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
    const expectedArgs = {
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
    };

    await fetchGraphQL({ query: request.query, variables: request.variables });

    expect(fetch).toHaveBeenCalledWith(graphqlEndpoint, expectedArgs);
  });

  it('should call fetch with correct arguments for preview request', async () => {
    const expectedArgs = {
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
    };

    await fetchGraphQL({
      query: request.query,
      variables: request.variables,
      preview: true,
    });

    expect(fetch).toHaveBeenCalledWith(graphqlEndpoint, expectedArgs);
  });

  it('should call fetch with correct arguments for tags', async () => {
    const expectedArgs = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: request.query,
        variables: request.variables,
      }),
      next: {
        tags: ['post'],
      },
      cache: 'force-cache',
    };

    await fetchGraphQL({
      query: request.query,
      variables: request.variables,
      tags: ['post'],
    });

    expect(fetch).toHaveBeenCalledWith(graphqlEndpoint, expectedArgs);
  });

  it('should call fetch with correct arguments for revalidate', async () => {
    const expectedArgs = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: request.query,
        variables: request.variables,
      }),
      next: {
        revalidate: 5,
      },
      cache: 'force-cache',
    };

    await fetchGraphQL({
      query: request.query,
      variables: request.variables,
      revalidate: 5,
    });

    expect(fetch).toHaveBeenCalledWith(graphqlEndpoint, expectedArgs);
  });
});
