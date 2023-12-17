import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

const s3 = new S3({
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },
  region: 'ap-southeast-1',
});

const deleteFileFromS3 = async ({
  key,
  url,
}: {
  key?: string;
  url?: string;
}) => {
  if (!key && !url) {
    throw new Error('Must provide either key or url');
  }

  if (key && url) {
    throw new Error('Must provide either key or url, not both');
  }

  if (url) {
    key = url.split('aws.com/').pop();
  }

  return await s3.deleteObject({
    Bucket: env.awsS3BucketName,
    Key: key!,
  });
};

export const getPresignedUploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  const command = new PutObjectCommand({
    Bucket: env.awsS3BucketName,
    Key: key,
    ContentType: contentType,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
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
  return await s3.putObject({
    Bucket: env.awsS3BucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
};

export { deleteFileFromS3, uploadBufferToS3 };
