import { KeysToCamelCase, keysToCamelCase } from '@/utils/camelCase';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET_NAME: z.string(),
  DATABASE_URL: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.string(),
  EMAIL_SERVER_USER: z.string().email(),
  EMAIL_SERVER_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),
});

export type Env = KeysToCamelCase<z.infer<typeof EnvSchema>>;

export const env: Env = (() => {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const convertToRedAndBold = (str: string) => `\x1b[1m\x1b[31m${str}\x1b[0m`;
    const message = `Invalid environment variables: {\n${result.error.issues
      .map(
        issue =>
          `    ${convertToRedAndBold(issue.path.join('.'))}: ${issue.message}`
      )
      .join(', \n')}\n}`;
    throw new Error(message);
  }
  return keysToCamelCase(result.data);
})();
