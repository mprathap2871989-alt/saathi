// src/app/community/loading.tsx
export default function CommunityLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div>
          <div className="h-7 bg-stone-200 rounded w-32 mb-1" />
          <div className="h-4 bg-stone-200 rounded w-24" />
        </div>
        <div className="h-9 bg-stone-200 rounded-full w-24" />
      </div>
      <div className="h-12 bg-stone-200 rounded-xl mb-3" />
      <div className="h-10 bg-stone-200 rounded-xl mb-3" />
      <div className="flex gap-2 mb-5">
        {[80, 100, 90, 110, 85].map((w, i) => (
          <div key={i} className="h-7 bg-stone-200 rounded-full flex-shrink-0" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 mb-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-stone-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-stone-200 rounded w-40" />
              <div className="h-4 bg-stone-200 rounded w-full" />
              <div className="h-3 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
