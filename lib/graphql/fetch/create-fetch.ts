interface CreateFetchOptions {
  spaceId: string;
  accessToken: string;
  previewToken: string;
}

export function createFetch({
  spaceId,
  accessToken,
  previewToken,
}: CreateFetchOptions) {
  async function fetchGraphQL(options: {
    query: string;
    variables: { [key: string]: string };
    preview?: boolean;
    tags?: Array<string>;
    revalidate?: number;
  }) {
    const res = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            options.preview ? previewToken : accessToken
          }`,
        },
        body: JSON.stringify({
          query: options.query,
          variables: options.variables,
        }),
        ...(options.tags || options.revalidate
          ? {
              next: {
                ...(options.tags
                  ? { tags: options.tags }
                  : { revalidate: options.revalidate }),
              },
            }
          : {}),
        cache: options.preview ? 'no-store' : 'force-cache',
      } as RequestInit,
    );

    const data = await res.json();

    return data;
  }

  return { fetchGraphQL };
}
