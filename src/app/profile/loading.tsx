// src/app/profile/loading.tsx
export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-7 bg-stone-200 rounded w-32 mb-5" />
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-stone-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-5 bg-stone-200 rounded w-36" />
            <div className="h-3 bg-stone-200 rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0,1,2].map(i => (
            <div key={i} className="bg-stone-100 rounded-xl p-3 h-16" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[0,1].map(i => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 h-24" />
        ))}
      </div>
    </div>
  );
}
