import { z } from 'zod';
import { config } from 'dotenv';
config();

const envSchema = z.object({
  RABBITMQ_URL: z.string().trim().nonempty('RABBITMQ_URL is required.'),
  RABBITMQ_QUEUE: z.string().trim().nonempty('RABBITMQ_QUEUE is required.'),
  DB_HOST: z.string().trim().nonempty('DB_HOST is required.'),
  DB_PORT: z.string().trim().nonempty('DB_PORT is required.').transform(Number),
  DB_USERNAME: z.string().trim().nonempty('DB_USERNAME is required.'),
  DB_PASSWORD: z.string().trim().nonempty('DB_PASSWORD is required.'),
  DB_NAME: z.string().trim().nonempty('DB_NAME is required.'),
  REDIS_URL: z.string().trim().nonempty('REDIS_URL is required.'),
  REDIS_HOST: z.string().trim().nonempty('REDIS_HOST is required.'),
  REDIS_PORT: z
    .string()
    .trim()
    .nonempty('REDIS_PORT is required.')
    .transform(Number),
  REDIS_PASSWORD: z.string().trim().nonempty('REDIS_PASSWORD is required.'),
  JWT_SECRET: z.string().trim().nonempty('JWT_SECRET is required.'),
  JWT_EXPIRES_IN: z.string().trim().nonempty('JWT_EXPIRES_IN is required.'),
  JWT_2FA_SECRET: z.string().trim().nonempty('JWT_2FA_SECRET is required.'),
  JWT_2FA_EXPIRES_IN: z
    .string()
    .trim()
    .nonempty('JWT_2FA_EXPIRES_IN is required.'),
  JWT_REFRESH_SECRET: z
    .string()
    .trim()
    .nonempty('JWT_REFRESH_SECRET is required.'),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .trim()
    .nonempty('JWT_REFRESH_EXPIRES_IN is required.'),
  ENCRYPTION_KEY: z.string().trim().nonempty('ENCRYPTION_KEY is required.'),
  BASE_URL_VERIFY_EMAIL: z
    .string()
    .trim()
    .nonempty('BASE_URL_VERIFY_EMAIL is required.'),
  BASE_URL_RESET_PASSWORD: z
    .string()
    .trim()
    .nonempty('BASE_URL_RESET_PASSWORDs is required.'),
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
  DB_HOST: envParsed.data.DB_HOST,
  DB_PORT: envParsed.data.DB_PORT,
  DB_USERNAME: envParsed.data.DB_USERNAME,
  DB_PASSWORD: envParsed.data.DB_PASSWORD,
  DB_NAME: envParsed.data.DB_NAME,
  REDIS_URL: envParsed.data.REDIS_URL,
  REDIS_HOST: envParsed.data.REDIS_HOST,
  REDIS_PORT: envParsed.data.REDIS_PORT,
  REDIS_PASSWORD: envParsed.data.REDIS_PASSWORD,
  JWT_SECRET: envParsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: envParsed.data.JWT_EXPIRES_IN,
  JWT_2FA_SECRET: envParsed.data.JWT_2FA_SECRET,
  JWT_2FA_EXPIRES_IN: envParsed.data.JWT_2FA_EXPIRES_IN,
  JWT_REFRESH_SECRET: envParsed.data.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: envParsed.data.JWT_REFRESH_EXPIRES_IN,
  ENCRYPTION_KEY: envParsed.data.ENCRYPTION_KEY,
  BASE_URL_VERIFY_EMAIL: envParsed.data.BASE_URL_VERIFY_EMAIL,
  BASE_URL_RESET_PASSWORD: envParsed.data.BASE_URL_RESET_PASSWORD,
};
