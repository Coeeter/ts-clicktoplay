import { playSong } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute(async (req, session) => {
  const body = (await req.json()) as {
    songId: string | null;
    songs: string[];
  };
  const result = await playSong({
    session: session!,
    songId: body.songId || body.songs[0],
    songIds: body.songs,
  });
  return createJsonResponse(result);
});
