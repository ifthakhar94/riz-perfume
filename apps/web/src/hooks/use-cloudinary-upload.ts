"use client";

import { useCallback, useState } from "react";

import { env } from "@/lib/env";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

/**
 * Uploads an image directly to Cloudinary using an unsigned upload preset and
 * returns the hosted URL. Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
 * NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. The returned `secureUrl` is what we
 * store on the product (`imageUrl` / `ogImageUrl`).
 */
export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = Boolean(
    env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  );

  const upload = useCallback(async (file: File): Promise<CloudinaryUploadResult> => {
    if (!env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed (${response.status})`);
      }
      const data = (await response.json()) as CloudinaryResponse;
      return { secureUrl: data.secure_url, publicId: data.public_id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, error, isConfigured };
}
