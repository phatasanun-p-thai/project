export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <header>
        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
      </header>

      <section className="space-y-4">
        <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </section>
    </div>
  );
}