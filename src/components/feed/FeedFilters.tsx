"use client";

// src/components/feed/FeedFilters.tsx
// Manages search / category / sort state via URL params.
// Keeps the community feed page a server component for SEO & performance.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface FeedFiltersProps {
  currentSearch?:   string;
  currentCategory?: string;
  currentSort?:     string;
}

export default function FeedFilters({
  currentSearch,
  currentCategory,
  currentSort,
}: FeedFiltersProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local search input state (debounced before hitting URL)
  const [searchInput, setSearchInput] = useState(currentSearch ?? "");

  // Sync input if URL changes externally (e.g. back/forward)
  useEffect(() => { setSearchInput(currentSearch ?? ""); }, [currentSearch]);

  /** Build new URL preserving existing params, overriding given keys */
  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  const navigate = (url: string) =>
    startTransition(() => router.push(url, { scroll: false }));

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === (currentSearch ?? "")) return; // no change
      navigate(buildUrl({ search: trimmed || undefined }));
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const setCategory = (catId: string | undefined) =>
    navigate(buildUrl({ category: catId }));

  const setSort = (sort: string) =>
    navigate(buildUrl({ sort }));

  const clearAll = () => {
    setSearchInput("");
    startTransition(() => router.push(pathname, { scroll: false }));
  };

  const hasActiveFilters = !!(currentSearch || currentCategory || currentSort === "helpful");

  return (
    <div className={cn("space-y-3 transition-opacity", isPending && "opacity-60")}>
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search stories…"
          className="w-full pl-9 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none
                     focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400 placeholder-gray-400 text-gray-800"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(""); navigate(buildUrl({ search: undefined })); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Sort + Clear */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {(["latest", "helpful"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize",
                (currentSort ?? "latest") === s
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white border border-stone-200 text-gray-600 hover:bg-stone-50"
              )}
            >
              {s === "latest" ? "Latest" : "Most Helpful"}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Category pills — scrollable on mobile */}
      <div className="flex flex-wrap gap-2 pb-1">
        <Pill
          active={!currentCategory}
          onClick={() => setCategory(undefined)}
        >
          All Topics
        </Pill>
        {CATEGORIES.map((cat) => (
          <Pill
            key={cat.id}
            active={currentCategory === cat.id}
            onClick={() => setCategory(currentCategory === cat.id ? undefined : cat.id)}
          >
            {cat.emoji} {cat.label}
          </Pill>
        ))}
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <SlidersHorizontal size={11} />
          {[
            currentCategory && CATEGORIES.find((c) => c.id === currentCategory)?.label,
            currentSearch && `"${currentSearch}"`,
            currentSort === "helpful" && "Most Helpful",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap",
        active
          ? "bg-emerald-700 text-white shadow-sm"
          : "bg-white border border-stone-200 text-gray-600 hover:bg-stone-50"
      )}
    >
      {children}
    </button>
  );
}
