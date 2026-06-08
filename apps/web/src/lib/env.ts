import { z } from "zod";

/**
 * Validated, public runtime configuration. Only `NEXT_PUBLIC_*` variables are
 * referenced so Next.js can statically inline them into the client bundle.
 * NEVER put secrets here — anything in this file ships to the browser.
 */
const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000/api"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  // Cloudinary (unsigned upload preset) — used by the dashboard image uploader.
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
});

export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
});
