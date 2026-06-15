"use client";

// src/components/feed/Pagination.tsx

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  hasMore:     boolean;
  search?:     string;
  category?:   string;
  sort?:       string;
}

export default function Pagination({
  currentPage,
  hasMore,
  search,
  category,
  sort,
}: PaginationProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (search)   params.set("search", search);
    if (category) params.set("category", category);
    if (sort)     params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const go = (page: number) =>
    startTransition(() => {
      router.push(buildUrl(page), { scroll: true });
    });

  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className={cn("flex items-center justify-between mt-8 pt-4 border-t border-stone-200", isPending && "opacity-50")}>
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 bg-white text-gray-600
                   hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} /> Previous
      </button>

      <span className="text-sm text-gray-500 font-medium">Page {currentPage}</span>

      <button
        onClick={() => go(currentPage + 1)}
        disabled={!hasMore || isPending}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 bg-white text-gray-600
                   hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}
