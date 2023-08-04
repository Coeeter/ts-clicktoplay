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
    const nextSong = queue.items.find(item => item.id === currentSong.nextId);
    if (!nextSong) {
      throw new NotFoundError('Next song not found');
    }
    await updateCurrentSongInQueue({
      session: session!,
      currentSongId: nextSong.songId,
    });
    return createJsonResponse({
      message: 'Song skipped',
    });
  }
);
