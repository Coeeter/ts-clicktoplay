import { playSong } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute<{ queueId: string }>(
  async (req, session, params) => {
    const body = (await req.json()) as {
      songId: string | null;
      songs: string[];
    };
    await playSong({
      session: session!,
      songId: body.songId || body.songs[0],
      songIds: body.songs,
    });
    return createJsonResponse({
      message: 'Song played',
    });
  }
);
