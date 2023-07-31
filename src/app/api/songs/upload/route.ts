import { createSong, getSongFileUploadUrl } from '@/lib/songs';
import {
  createJsonResponse,
  extractSearchParams,
  protectedApiRoute,
} from '@/utils';

export const GET = protectedApiRoute(async req => {
  const url = await getSongFileUploadUrl(extractSearchParams(req.url));
  return createJsonResponse({ url });
});

export const POST = protectedApiRoute(async (req, session) => {
  const { id } = await createSong({
    ...(await req.json()),
    session: session!,
  });
  return createJsonResponse({ id });
});
