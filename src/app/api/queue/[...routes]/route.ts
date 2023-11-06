import {
  insertSongsToQueue,
  moveSongsInQueue,
  playPlaylist,
  playSong,
  removeSongsFromQueue,
  updateQueueSettings,
} from '@/actions/queue';
import { NotFoundError, protectedApiRoute, zodParse } from '@/utils';
import {
  insertSongsToQueueSchema,
  moveSongsInQueueSchema,
  playPlaylistSchema,
  playSongSchema,
  removeSongsFromQueueSchema,
  shuffleSchema,
  updateRepeatModeSchema,
} from '@/schema/queue';

type Params = {
  routes: string[];
};

export const POST = protectedApiRoute<Params>(async (req, session, params) => {
  const firstPath = params!.routes[0];
  if (firstPath === 'add') {
    const { songId } = zodParse(insertSongsToQueueSchema)(await req.json());
    return {
      body: await insertSongsToQueue({
        session: session!,
        songs: [songId],
      }),
    };
  }
  if (firstPath === 'play') {
    const { songId, songs } = zodParse(playSongSchema)(await req.json());
    return {
      body: await playSong({
        session: session!,
        songIds: songs,
        songId,
      }),
    };
  }
  if (firstPath === 'playlist') {
    const playlistId = params!.routes[1];
    if (!playlistId) throw new NotFoundError();
    const { songId } = zodParse(playPlaylistSchema)({
      ...(await req.json()),
      playlistId,
    });
    return {
      body: await playPlaylist({
        session: session!,
        playlistId: playlistId,
        currentSongId: songId,
      }),
    };
  }
  if (firstPath === 'remove') {
    const { queueItemId } = zodParse(removeSongsFromQueueSchema)(
      await req.json()
    );
    return {
      body: await removeSongsFromQueue({
        session: session!,
        queueItemIds: [queueItemId],
      }),
    };
  }
  if (firstPath === 'reorder') {
    return {
      body: await moveSongsInQueue({
        session: session!,
        ...zodParse(moveSongsInQueueSchema)(await req.json()),
      }),
    };
  }
  if (firstPath === 'repeat') {
    return {
      body: await updateQueueSettings({
        session: session!,
        ...zodParse(updateRepeatModeSchema)(await req.json()),
      }),
    };
  }
  if (firstPath === 'shuffle') {
    const { shuffle, newItems } = zodParse(shuffleSchema)(await req.json());
    return {
      body: await updateQueueSettings({
        session: session!,
        isShuffled: shuffle,
        newOrder: newItems,
      }),
    };
  }
  throw new NotFoundError();
});
