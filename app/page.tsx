import { s3 } from '@/lib/s3';

export default async function Home() {
  const result = await s3
    .getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: 'favicon.ico',
    })
    .promise();

  const body = (result.Body as Buffer).toString('base64');
  return (
    <div className="container mx-auto">
      <img src={`data:image/*;base64,${body}`} />
    </div>
  );
}
