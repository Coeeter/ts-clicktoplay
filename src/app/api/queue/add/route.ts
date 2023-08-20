import { insertSongsToQueue } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute(async (req, session) => {
  const { songId } = (await req.json()) as { songId: string };
  const result = await insertSongsToQueue({
    session: session!,
    songs: [songId],
  });
  return createJsonResponse(result);
});
