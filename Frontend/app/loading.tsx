export default function Loading() {
  return (
    <main className="cc-loading-screen" aria-label="Loading CareCircle">
      <section className="cc-loading-shell">
        <div className="cc-loading-grid cc-loading-grid--hero">
          <div className="cc-loading-card cc-loading-card--span-8 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="cc-loading-pulse h-12 w-12 rounded-2xl border border-white/10 bg-white/5" />
              <div className="flex-1 space-y-3">
                <div className="cc-loading-line w-40" />
                <div className="cc-loading-line w-3/4" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="cc-loading-line w-1/2" />
              <div className="cc-loading-line w-5/6" />
              <div className="cc-loading-line w-2/3" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="cc-loading-card p-4">
                <div className="cc-loading-line w-28" />
                <div className="mt-3 cc-loading-line w-20" />
              </div>
              <div className="cc-loading-card p-4">
                <div className="cc-loading-line w-24" />
                <div className="mt-3 cc-loading-line w-32" />
              </div>
            </div>
          </div>

          <div className="cc-loading-card cc-loading-card--span-4 p-5 sm:p-6">
            <div className="cc-loading-line w-32" />
            <div className="mt-4 grid gap-3">
              <div className="cc-loading-line h-4 w-full" />
              <div className="cc-loading-line h-4 w-5/6" />
              <div className="cc-loading-line h-4 w-4/6" />
              <div className="cc-loading-line h-4 w-3/4" />
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="cc-loading-line w-24" />
              <div className="mt-3 cc-loading-line w-40" />
              <div className="mt-3 cc-loading-line w-2/3" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 cc-loading-grid--cards">
          <div className="cc-loading-card cc-loading-card--span-4 p-4">
            <div className="cc-loading-line w-28" />
            <div className="mt-4 space-y-3">
              <div className="cc-loading-line w-full" />
              <div className="cc-loading-line w-5/6" />
              <div className="cc-loading-line w-2/3" />
            </div>
          </div>

          <div className="cc-loading-card cc-loading-card--span-4 p-4">
            <div className="cc-loading-line w-24" />
            <div className="mt-4 space-y-3">
              <div className="cc-loading-line w-full" />
              <div className="cc-loading-line w-4/5" />
              <div className="cc-loading-line w-3/5" />
            </div>
          </div>

          <div className="cc-loading-card cc-loading-card--span-4 p-4">
            <div className="cc-loading-line w-32" />
            <div className="mt-4 space-y-3">
              <div className="cc-loading-line w-full" />
              <div className="cc-loading-line w-3/4" />
              <div className="cc-loading-line w-2/5" />
            </div>
          </div>
        </div>

        <div className="mt-4 cc-loading-card cc-loading-card--span-12 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="cc-loading-line w-40" />
              <div className="cc-loading-line w-72 max-w-full" />
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
              <span className="cc-loading-pulse h-2.5 w-2.5 rounded-full bg-cyan-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Syncing realtime hospital data</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
