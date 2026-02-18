"use client";

import * as React from "react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export function Field({ label, description, error, className, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-700">
      <span className="text-[11px] text-gray-600">{label}</span>
      <input
        className={`h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40 ${className ?? ""}`}
        {...props}
      />
      {description && !error && (
        <span className="text-[10px] text-gray-400">{description}</span>
      )}
      {error && <span className="text-[10px] text-rose-500">{error}</span>}
    </label>
  );
}
