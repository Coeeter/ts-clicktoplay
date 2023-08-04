import { playPlaylist } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute<{ queueId: string; playlistId: string }>(
  async (req, session, params) => {
    const body = (await req.json()) as { songId: string };
    await playPlaylist({
      session: session!,
      playlistId: params!.playlistId,
      currentSongId: body.songId,
    });
    return createJsonResponse({
      message: 'Playlist played',
    });
  }
);
