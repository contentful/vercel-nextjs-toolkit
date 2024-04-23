import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function appRouterHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const bypass = searchParams.get('x-vercel-protection-bypass');

  if (bypass !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    return new Response('Invalid bypass token', { status: 401 });
  }

  if (!path) {
    return new Response('Missing required parameter: `path`', { status: 400 });
  }

  const decodedPath = decodeURIComponent(path);

  draftMode().enable();
  redirect(
    `${decodedPath}?x-vercel-protection-bypass=${bypass}&x-vercel-set-bypass-cookie=samesitenone`,
  );
}
