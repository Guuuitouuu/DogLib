export default function DashboardLoading() {
  return (
    <main className="flex-1 space-y-6 px-5 py-6 md:px-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </main>
  );
}
