/** Static stand-in rendered while the interactive booking flow loads. */
export function BookingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading booking calendar"
      className="overflow-hidden rounded-[2.5rem] border border-line bg-white shadow-[0_50px_120px_-60px_rgb(23_19_15/0.45)]"
    >
      <div className="grid animate-pulse lg:grid-cols-[19.5rem_minmax(0,1fr)] xl:grid-cols-[22.5rem_minmax(0,1fr)]">
        <div className="space-y-5 border-b border-line bg-paper-2/70 p-10 lg:border-r lg:border-b-0">
          <div className="size-11 rounded-xl bg-paper-3" />
          <div className="h-10 w-4/5 rounded-xl bg-paper-3" />
          <div className="h-4 w-1/2 rounded-full bg-paper-3" />
          <div className="h-4 w-2/3 rounded-full bg-paper-3" />
        </div>
        <div className="space-y-6 p-10 lg:p-12">
          <div className="h-8 w-72 rounded-full bg-paper-2" />
          <div className="h-12 w-3/4 rounded-2xl bg-paper-2" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-56 rounded-[1.75rem] bg-paper-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
