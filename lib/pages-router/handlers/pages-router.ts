import { NextApiRequest, NextApiResponse } from 'next';

export function enableDraftHandler(req: NextApiRequest, res: NextApiResponse) {
  const { path, bypass } = req.query;

  if (bypass !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    return res.status(401).json({
      message: 'Invalid bypass token',
    });
  }

  if (!path) {
    return res.status(400).json({
      message: 'Missing required parameter: `path`',
    });
  }

  console.log('HERE!');
  const decodedPath = decodeURIComponent(path as string);

  // TODO: validate path

  res.setDraftMode({ enable: true });
  res.setHeader(
    'Location',
    `${decodedPath}?x-vercel-bypass-token=${bypass}&x-vercel-set-bypass-cookie=samesitenone`,
  );

  return res.status(307).end();
}
