import { z } from 'zod';
import { BadRequestError } from './response';

export const zodParse = <T>(schema: z.ZodType<T, any>) => {
  return (value: unknown) => {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    const error = result.error.issues.map(issue => ({
      message: issue.message,
      path: issue.path[0],
    }));
    throw new BadRequestError({ error });
  };
};
