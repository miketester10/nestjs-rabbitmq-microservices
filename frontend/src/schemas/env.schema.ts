import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().trim().nonempty("API_BASE_URL is required."),
});

const envParsed = envSchema.safeParse(import.meta.env);

if (!envParsed.success) {
  console.error("❌ Config validation error:", z.treeifyError(envParsed.error).properties);
  throw new Error("Invalid environment variables");
}

type envType = z.infer<typeof envSchema>;
export const env: envType = envParsed.data;
export const isDevelopment = import.meta.env.DEV;
