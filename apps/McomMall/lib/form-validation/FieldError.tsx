"use client";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface FieldErrorProps {
  message?: string | null;
  className?: string;
  id?: string;
}

/**
 * Inline validation message for fields that are not managed by
 * react-hook-form's <FormMessage />. Exposes `data-field-error` so
 * `scrollToFirstError` can locate it.
 */
export function FieldError({ message, className, id }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      data-field-error
      role="alert"
      className={cn("mt-1 flex items-center gap-1 text-sm text-destructive", className)}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
