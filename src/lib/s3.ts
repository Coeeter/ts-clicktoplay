import { S3 } from 'aws-sdk';

export const s3 = new S3({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  accessKeyId: process.env.AWS_ACCESS_KEY!,
});
