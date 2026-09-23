export default function AlarmsLoading() {
  return (
    <div className="space-y-6">
      <header>
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[76px] animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="h-[150px] animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm" />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="h-11 animate-pulse bg-gray-50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse border-t border-gray-100"
          />
        ))}
      </div>
    </div>
  );
}