import { getUpdateAlbumCoverUploadUrl, updateSong } from '@/actions/songs';
import { getUploadImageUrlSchema, updateSongSchema } from '@/schema/song';
import { extractSearchParams, protectedApiRoute, zodParse } from '@/utils';

export const GET = protectedApiRoute<{ id: string }>(
  async (req, session, params) => ({
    body: {
      url: await getUpdateAlbumCoverUploadUrl({
        session: session!,
        ...zodParse(getUploadImageUrlSchema)({
          ...extractSearchParams(req.url),
          ...params,
        }),
      }),
    },
  })
);

export const PUT = protectedApiRoute<{ id: string }>(
  async (req, session, params) => ({
    body: await updateSong({
      session: session!,
      ...zodParse(updateSongSchema)({
        ...extractSearchParams(req.url),
        ...params,
      }),
    }),
  })
);
