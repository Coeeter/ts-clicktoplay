import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { s3 } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { parseBuffer } from 'music-metadata';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  let songKey: string | null = null;
  let imageKey: string | null = null;

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
    songKey = `songs/${randomUUID()}.${extension}`;
    const songUrl = await uploadBufferToS3({
      key: songKey,
      buffer: buffer,
      contentType: 'audio/mpeg',
    });

    const audioData = await parseBuffer(buffer);
    const image = audioData.common.picture?.[0].data;
    imageKey = image ? `images/${randomUUID()}.jpg` : null;
    const imageUrl = image
      ? await uploadBufferToS3({
          buffer: image,
          key: imageKey!,
          contentType: 'image/jpeg',
        })
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
    if (songKey) {
      await deleteFileFromS3(songKey);
    }
    if (imageKey) {
      await deleteFileFromS3(imageKey);
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

const deleteFileFromS3 = async (key: string) => {
  return await s3
    .deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
    .promise();
};

const uploadBufferToS3 = async ({
  buffer,
  key,
  contentType,
}: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) => {
  return await s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
    .promise()
    .then(result => result.Location);
};
