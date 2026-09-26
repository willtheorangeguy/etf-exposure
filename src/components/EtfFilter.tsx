'use client';

import { useRouter, useSearchParams } from "next/navigation";

export default function EtfFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  return (
    <input
      key={q}
      defaultValue={q}
      placeholder="Filter by ticker or name"
      className="mt-4 w-full rounded border border-zinc-300 bg-transparent px-3 py-2 sm:w-96 dark:border-zinc-700"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const url = new URL(window.location.href);
          const v = (e.target as HTMLInputElement).value.trim();
          if (v) url.searchParams.set("q", v);
          else url.searchParams.delete("q");
          router.push(url.toString());
        }
      }}
    />
  );
}
