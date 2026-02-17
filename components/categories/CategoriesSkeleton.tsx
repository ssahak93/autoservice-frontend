export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-light h-32 animate-pulse rounded-xl p-6">
          <div className="h-6 w-3/4 rounded bg-neutral-200" />
          <div className="mt-4 h-4 w-1/2 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
