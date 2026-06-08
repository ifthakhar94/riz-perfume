"use client";

import { useRef } from "react";

import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

export function CloudinaryImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, isConfigured } = useCloudinaryUpload();

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const { secureUrl } = await upload(file);
      onChange(secureUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview of an external Cloudinary URL
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {!isConfigured ? (
        <p className="text-xs text-muted-foreground">
          Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable
          uploads.
        </p>
      ) : null}
    </div>
  );
}
