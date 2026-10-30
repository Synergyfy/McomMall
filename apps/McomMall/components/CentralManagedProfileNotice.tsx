"use client";

import React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

interface CentralManagedProfileNoticeProps {
  /** Central dashboard tab that owns this profile. */
  centralPath?: string;
  className?: string;
}

/**
 * MCOM Central is the identity and business-profile source of truth. The mall
 * renders the synced values read-only and links users to Central to make edits.
 */
export default function CentralManagedProfileNotice({
  centralPath = "/dashboard/business-profile",
  className = "",
}: CentralManagedProfileNoticeProps) {
  const centralUrl =
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3000";
  const href = `${centralUrl.replace(/\/+$/, "")}${centralPath}`;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-orange-900/40 dark:bg-orange-950/20 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Managed by MCOM Central
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Your name, contact details and business information are synced from
            MCOM Central every time you sign in. Make changes there and they
            will appear here automatically.
          </p>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
      >
        Edit on MCOM Central
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
