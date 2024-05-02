interface CreateFetchOptions {
  spaceId: string;
  accessToken: string;
  previewToken: string;
}

interface FetchGragphQLOptions {
  query: string;
  variables: {
    [key: string]: string | object | boolean | number | undefined;
  };
  preview?: boolean;
  tags?: Array<string>;
  revalidate?: number;
}

export function createFetch({
  spaceId,
  accessToken,
  previewToken,
}: CreateFetchOptions) {
  async function fetchGraphQL(options: FetchGragphQLOptions) {
    const { query, variables, preview, tags, revalidate } = options;

    const res = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${preview ? previewToken : accessToken}`,
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
        cache: preview ? 'no-store' : 'force-cache',
      } as RequestInit,
    );

    const data = await res.json();

    return data;
  }

  return { fetchGraphQL };
}
