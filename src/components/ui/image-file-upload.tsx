"use client";

import { Loader2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageFileUploadProps = {
  label: string;
  description?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  onUploaded: (url: string) => void;
  upload: (formData: FormData) => Promise<ActionResult<{ url: string }>>;
  hiddenFields?: Record<string, string>;
};

export function ImageFileUpload({
  label,
  description,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  disabled,
  className,
  onUploaded,
  upload,
  hiddenFields,
}: ImageFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    if (hiddenFields) {
      for (const [key, value] of Object.entries(hiddenFields)) {
        fd.set(key, value);
      }
    }

    startTransition(async () => {
      const result = await upload(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onUploaded(result.data.url);
    });
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || pending}
        onChange={onPickFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        onClick={() => inputRef.current?.click()}
        className="w-full justify-center sm:w-auto"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="size-4" aria-hidden />
        )}
        {label}
      </Button>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
