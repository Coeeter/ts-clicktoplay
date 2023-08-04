import { getQueue, updateCurrentSongInQueue } from '@/lib/queue';
import {
  BadRequestError,
  NotFoundError,
  createJsonResponse,
  protectedApiRoute,
} from '@/utils';

export const POST = protectedApiRoute<{ queueId: string }>(
  async (req, session, params) => {
    const queue = await getQueue(session!);
    if (queue.currentlyPlayingId === null) {
      throw new BadRequestError('Queue is empty');
    }
    const currentSong = queue.items.find(
      item => item.id === queue.currentlyPlayingId
    );
    if (!currentSong) {
      throw new BadRequestError('Queue is empty');
    }
    const prevSong = queue.items.find(item => item.id === currentSong.prevId);
    if (!prevSong) {
      throw new NotFoundError('Prev song not found');
    }
    await updateCurrentSongInQueue({
      session: session!,
      currentSongId: prevSong.songId,
    });
    return createJsonResponse({
      message: 'Song skipped',
    });
  }
);
