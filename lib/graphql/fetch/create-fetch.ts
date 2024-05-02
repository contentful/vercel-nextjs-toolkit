interface CreateFetchOptions {
  spaceId: string;
  accessToken: string;
  previewToken: string;
}

interface FetchGragphQLOptions {
  query: string;
  variables: { [key: string]: string };
  preview?: boolean;
  tags?: Array<string>;
  revalidate?: number;
}

export function experimentalCreateFetch({
  spaceId,
  accessToken,
  previewToken,
}: CreateFetchOptions) {
  async function experimentalFetchGraphQL(options: FetchGragphQLOptions) {
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

  return { experimentalFetchGraphQL };
}
