import { z } from 'zod';
import { config } from 'dotenv';
config();

const envSchema = z.object({
  RABBITMQ_URL: z.string().trim().nonempty('RABBITMQ_URL is required.'),
  RABBITMQ_QUEUE: z.string().trim().nonempty('RABBITMQ_QUEUE is required.'),
  HOST: z.string().trim().nonempty('HOST is required.'),
  PORT: z.string().trim().nonempty('PORT is required.').transform(Number),
  USER_EMAIL: z.string().trim().nonempty('USER_EMAIL is required.'),
  PASSWORD_APP: z.string().trim().nonempty('PASSWORD_APP is required.'),
});

type envType = z.infer<typeof envSchema>;

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error(
    '❌ Config validation error:',
    z.treeifyError(envParsed.error).properties,
  );
  throw new Error('Invalid environment variables');
}

export const env: envType = {
  RABBITMQ_URL: envParsed.data.RABBITMQ_URL,
  RABBITMQ_QUEUE: envParsed.data.RABBITMQ_QUEUE,
  HOST: envParsed.data.HOST,
  PORT: envParsed.data.PORT,
  USER_EMAIL: envParsed.data.USER_EMAIL,
  PASSWORD_APP: envParsed.data.PASSWORD_APP,
};
