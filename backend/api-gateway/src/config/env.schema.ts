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
    .nonempty('BASE_URL_RESET_PASSWORD is required.'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().trim().nonempty('PORT is required.').transform(Number),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error(
    '❌ Config validation error:',
    z.treeifyError(envParsed.error).properties,
  );
  throw new Error('Invalid environment variables');
}

type envType = z.infer<typeof envSchema>;
export const env: envType = envParsed.data;
export const isDevelopment = env.NODE_ENV !== 'production';
