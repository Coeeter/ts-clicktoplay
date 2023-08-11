import { playPlaylist } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute<{ playlistId: string }>(
  async (req, session, params) => {
    const body = (await req.json()) as { songId: string };
    const result = await playPlaylist({
      session: session!,
      playlistId: params!.playlistId,
      currentSongId: body.songId,
    });
    return createJsonResponse(result);
  }
);
