export function AuthCard({ content }) {
  function handleSubmit(event) {
    event.preventDefault();
    window.location.assign("/otp-verification");
  }

  return (
    <section className="flex min-h-[clamp(30rem,64vw,36.625rem)] w-full flex-col rounded-[clamp(1rem,2vw,1.25rem)] border border-nucleotide-lavender bg-white px-[clamp(1.25rem,4vw,2.3125rem)] pb-[clamp(1.75rem,4.5vw,3rem)] pt-[clamp(2.25rem,5.4vw,3.1875rem)] shadow-nucleotide">
      <div className="mx-auto w-full max-w-[28.0625rem] text-center">
        <h1 className="mx-auto max-w-[24rem] font-poppins text-[clamp(1.75rem,1.52rem+0.72vw,2rem)] font-medium leading-[1.03] tracking-[-0.02em] text-nucleotide-ink">
          {content.title}
        </h1>
        <p className="mt-[clamp(1rem,2vw,1.125rem)] font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-muted">
          {content.description}
        </p>
      </div>

      <form
        className="mx-auto mt-[clamp(2.5rem,7vw,3.9375rem)] w-full max-w-[33.8125rem] space-y-[clamp(0.875rem,1.7vw,0.9375rem)]"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-[clamp(0.5rem,1vw,0.5625rem)] block font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-ink">
            {content.phoneLabel}
          </span>
          <input
            type="tel"
            inputMode="tel"
            placeholder={content.phonePlaceholder}
            className="h-[clamp(3.25rem,7vw,3.625rem)] w-full rounded-lg border border-nucleotide-lavender bg-white px-[clamp(1rem,3.4vw,1.8125rem)] font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-ink outline-none transition placeholder:text-nucleotide-muted focus:border-nucleotide-purple focus:ring-4 focus:ring-nucleotide-purple/10"
            aria-label={content.phoneLabel}
          />
        </label>

        <button
          type="submit"
          className="flex h-[clamp(3.25rem,7vw,3.625rem)] w-full items-center justify-center gap-[clamp(0.5rem,1.5vw,0.625rem)] rounded-[10px] bg-nucleotide-purple px-5 font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/25"
        >
          {content.actionLabel}
          <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>

      <p className="mx-auto mt-auto w-full max-w-[33.8125rem] pt-[clamp(2.75rem,9vw,5.9375rem)] text-center font-poppins text-[clamp(0.875rem,0.8rem+0.38vw,1rem)] font-normal leading-5 text-nucleotide-muted">
        {content.helperText}
      </p>
    </section>
  );
}
