interface CreateFetchOptions {
  spaceId: string;
  accessToken: string;
  previewAccessToken: string;
}

export function createFetch({
  spaceId,
  accessToken,
  previewAccessToken,
}: CreateFetchOptions) {
  async function fetchGraphQL(query: string, variables = {}, preview = false) {
    const res = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${preview ? previewAccessToken : accessToken}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        cache: preview ? 'no-store' : 'force-cache',
      },
    );

    const data = await res.json();

    return data;
  }

  return { fetchGraphQL };
}
