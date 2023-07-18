import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    const fileType = searchParams.get('fileType');
    const extension = searchParams.get('extension');
    const type = searchParams.get('type');

    let key = `songs/${randomUUID()}.${extension ?? 'mp3'}`;
    if (type && type !== 'audio') {
      key = `images/${randomUUID()}.${extension ?? 'jpg'}`;
    }

    const presignedUrl = await getPresignedUploadUrl({
      key: key,
      contentType: fileType ?? (type !== 'audio' ? 'image/jpeg' : 'audio/mpeg'),
    });

    return new NextResponse(
      JSON.stringify({
        url: presignedUrl,
      })
    );
  } catch (e) {
    console.log('Error in GET /api/songs/upload\n', e);
    const json = {
      error: 'Something went wrong',
    };
    return new NextResponse(JSON.stringify(json), { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'You must be logged in to upload a song',
      },
      { status: 401 }
    );
  }
  const body = (await request.json()) as {
    url: string;
    title: string;
    duration: number;
    artist: string;
    albumCover?: string | null;
  };
  console.log(body);
  const result = await prisma.song.create({
    data: {
      url: body.url,
      title: body.title,
      duration: body.duration,
      artist: body.artist,
      albumCover: body.albumCover,
      uploaderId: session.user.id,
    },
  });
  const json = {
    id: result.id,
  };
  return new NextResponse(JSON.stringify(json), { status: 200 });
};
