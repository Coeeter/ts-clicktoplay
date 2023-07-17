import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { deleteFileFromS3, uploadBufferToS3 } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = async (
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) => {
  const session = await getServerSession();
  const formdata = await request.formData();
  const title = formdata.get('title')?.toString();
  const artist = formdata.get('artist')?.toString();
  const albumCover = formdata.get('albumCover');
  let albumCoverUrl: string | null = null;

  const song = await prisma.song.findUnique({
    where: {
      id: id,
    },
  });
  if (!song) {
    return NextResponse.json(
      {
        error: 'Song not found',
      },
      { status: 404 }
    );
  }

  if (song.uploaderId !== session?.user?.id) {
    return NextResponse.json(
      {
        error: 'You are not the owner of this song',
      },
      { status: 403 }
    );
  }

  if (albumCover) {
    const albumCoverBuffer = Buffer.from(
      await (albumCover as unknown as File).arrayBuffer()
    );
    albumCoverUrl = await uploadBufferToS3({
      buffer: albumCoverBuffer,
      contentType: 'image/jpeg',
      key: `images/${randomUUID()}.jpg`,
    }).then(res => res.Location);
  }

  if (albumCoverUrl && song.albumCover) {
    await deleteFileFromS3({ url: song.albumCover });
  }

  const result = await prisma.song.update({
    where: {
      id: id,
    },
    data: {
      title: title ?? song.title,
      artist: artist ?? song.artist,
      albumCover: albumCoverUrl ?? song.albumCover,
    },
  });

  return NextResponse.json(result);
};
