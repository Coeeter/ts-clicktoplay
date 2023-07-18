import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { deleteFileFromS3, getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) => {
  const user = await getServerSession().then(res => res?.user);
  const searchParams = new URL(request.url).searchParams;
  const fileType = searchParams.get('fileType');
  const extension = searchParams.get('extension');

  const song = await prisma.song.findUnique({
    where: {
      id: id,
    },
  });

  if (!song) {
    return new NextResponse(
      JSON.stringify({
        error: 'Song not found',
      }),
      { status: 404 }
    );
  }
  if (song.uploaderId !== user?.id) {
    return new NextResponse(
      JSON.stringify({
        error: 'You are not the owner of this song',
      }),
      { status: 403 }
    );
  }

  if (song.albumCover) {
    await deleteFileFromS3({ url: song.albumCover });
  }

  const presignedUrl = await getPresignedUploadUrl({
    key: `images/${randomUUID()}.${extension ?? 'jpg'}`,
    contentType: fileType ?? 'image/jpeg',
  });

  return new NextResponse(
    JSON.stringify({
      url: presignedUrl,
    })
  );
};

export const PUT = async (
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) => {
  const session = await getServerSession();
  const { title, artist, albumCover } = (await request.json()) as {
    title?: string | null;
    artist?: string | null;
    albumCover?: string | null;
  };

  const song = await prisma.song.findUnique({
    where: {
      id: id,
    },
  });
  if (!song) {
    return new NextResponse(
      JSON.stringify({
        error: 'Song not found',
      }),
      { status: 404 }
    );
  }
  if (song.uploaderId !== session?.user?.id) {
    return new NextResponse(
      JSON.stringify({
        error: 'You are not the owner of this song',
      }),
      { status: 403 }
    );
  }

  const result = await prisma.song.update({
    where: {
      id: id,
    },
    data: {
      title: title ?? song.title,
      artist: artist ?? song.artist,
      albumCover: albumCover ?? song.albumCover,
    },
  });

  return new NextResponse(JSON.stringify(result), { status: 200 });
};
