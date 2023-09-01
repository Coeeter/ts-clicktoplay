import { z } from 'zod';

export const songIdSchema = z
  .string({
    required_error: 'Song ID is required',
  })
  .cuid({
    message: 'Song ID is invalid',
  });

export const getUploadImageUrlSchema = z.object({
  id: songIdSchema,
  fileType: z.enum([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]),
  extension: z.enum(['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg']),
});

export const updateSongSchema = z.object({
  id: songIdSchema,
  title: z.string().min(1).max(100),
  artist: z.string().min(1).max(100),
  albumCover: z.string().url(),
});

export const getUploadUrlSchema = z
  .object({
    fileType: z.enum([
      'audio/mpeg',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]),
    extension: z.enum(['mp3', 'jpeg', 'jpg', 'png', 'gif', 'webp', 'svg']),
    type: z.enum(['audio', 'image']),
  })
  .refine(data => {
    if (data.type === 'audio') return data.fileType === 'audio/mpeg';
    return data.fileType !== 'audio/mpeg';
  });

export const createSongSchema = z.object({
  title: z.string().min(1).max(100),
  artist: z.string().max(100).nullable(),
  albumCover: z.string().url().nullable(),
  url: z.string().url(),
  duration: z.number().min(0),
});
