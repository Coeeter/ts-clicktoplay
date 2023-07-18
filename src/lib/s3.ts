import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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

  return await s3
    .deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key!,
    })
    .promise();
};

export const getPresignedUploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  return await s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
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
    .promise();
};

export { deleteFileFromS3, uploadBufferToS3 };
