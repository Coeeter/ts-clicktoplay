import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { deleteFileFromS3, uploadBufferToS3 } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { parseBuffer } from 'music-metadata';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  let songUrl: string | null = null;
  let imageUrl: string | null = null;

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'You must be logged in to upload a song',
        },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file = data.get('file') as unknown as File;
    if (!file) throw new Error('No file uploaded');

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop();
    songUrl = await uploadBufferToS3({
      key: `songs/${randomUUID()}.${extension}`,
      buffer: buffer,
      contentType: 'audio/mpeg',
    }).then(res => res.Location);

    const audioData = await parseBuffer(buffer);
    const image = audioData.common.picture?.[0].data;
    imageUrl = image
      ? await uploadBufferToS3({
          buffer: image,
          key: `images/${randomUUID()}.jpg`!,
          contentType: 'image/jpeg',
        }).then(res => res.Location)
      : null;

    const result = await prisma.song.create({
      data: {
        url: songUrl!,
        title: audioData.common.title ?? extractFileName(file),
        duration: audioData.format.duration ?? 0.0,
        artist: audioData.common.artist,
        albumCover: imageUrl,
        uploaderId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: result.id,
      },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    if (songUrl) {
      await deleteFileFromS3({ url: songUrl });
    }
    if (imageUrl) {
      await deleteFileFromS3({ url: imageUrl });
    }
    return NextResponse.json(
      {
        error: 'No file uploaded',
      },
      { status: 400 }
    );
  }
};

const extractFileName = (file: File) => {
  return file.name.lastIndexOf('.') > 0
    ? file.name.substring(0, file.name.lastIndexOf('.'))
    : file.name;
};
