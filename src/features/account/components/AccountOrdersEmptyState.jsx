function EmptyBoxIcon() {
  return (
    <svg
      className="size-[clamp(1.125rem,1rem+0.4vw,1.5rem)]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.75 5.75 7.2 12 10.65l6.25-3.45L12 3.75Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="m5.25 8.25 6 3.3v7.05l-6-3.5V8.25Z" fill="currentColor" opacity="0.72" />
      <path d="m18.75 8.25-6 3.3v7.05l6-3.5V8.25Z" fill="currentColor" />
      <path d="m8.3 5.8 6.1 3.4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function AccountOrdersEmptyState() {
  return (
    <section
      className="min-w-0 space-y-[clamp(0.75rem,1.5vw,1rem)] lg:mt-[clamp(5rem,7.8vw,9.375rem)]"
      aria-label="Blood test orders"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
          Orders
        </h2>

        <a
          href="/"
          className="inline-flex min-h-[clamp(2.75rem,3.6vw,3.625rem)] items-center justify-center rounded-lg bg-nucleotide-purple px-[clamp(1.25rem,3.2vw,2.125rem)] font-poppins text-[clamp(0.9375rem,0.82rem+0.34vw,1.25rem)] font-medium leading-[1.3] text-white shadow-sm transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender sm:w-auto"
        >
          Browse Products
        </a>
      </div>

      <div className="flex min-h-[clamp(7.5rem,12vw,14rem)] items-center justify-center rounded-[20px] bg-white px-[clamp(1rem,4vw,3rem)] py-[clamp(1.25rem,3vw,2rem)] shadow-nucleotide">
        <div className="mx-auto flex w-full max-w-[50rem] flex-col items-center text-center">
          <div className="grid size-[clamp(3rem,4.6vw,4.9375rem)] place-items-center rounded-full bg-gradient-to-t from-nucleotide-lavender to-white text-nucleotide-purple">
            <EmptyBoxIcon />
          </div>

          <h3 className="mt-[clamp(0.75rem,1.4vw,1.125rem)] font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
            No Orders Yet
          </h3>
          <p className="mt-1 max-w-[45rem] font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1.25rem)] leading-[1.45] text-nucleotide-muted">
            You haven&apos;t booked any blood tests yet. Start by exploring available tests and take
            control of your health.
          </p>
        </div>
      </div>
    </section>
  );
}
