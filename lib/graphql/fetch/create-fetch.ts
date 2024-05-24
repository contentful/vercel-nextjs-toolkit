import { draftMode } from 'next/headers';

interface CreateFetchOptions {
  spaceId: string;
  accessToken: string;
  previewToken: string;
}

interface FetchGraphQLOptions {
  query: string;
  variables: {
    [key: string]: string | object | boolean | number | undefined;
  };
  tags?: Array<string>;
  revalidate?: number;
}

export function createFetch({
  spaceId,
  accessToken,
  previewToken,
}: CreateFetchOptions) {
  async function fetchGraphQL(options: FetchGraphQLOptions) {
    const { isEnabled } = draftMode();
    const { query, variables, tags, revalidate } = options;

    const res = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${isEnabled ? previewToken : accessToken}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        ...(tags || revalidate
          ? {
              next: {
                ...(tags ? { tags } : { revalidate }),
              },
            }
          : {}),
        cache: isEnabled ? 'no-store' : 'force-cache',
      } as RequestInit,
    );

    return await res.json();
  }

  return { fetchGraphQL };
}
