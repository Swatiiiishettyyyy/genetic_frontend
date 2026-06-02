export function OtpVerificationCard({ content }) {
  function handleSubmit(event) {
    event.preventDefault();
    window.location.assign("/");
  }

  return (
    <section className="w-full rounded-[clamp(1rem,2vw,1.25rem)] border border-nucleotide-lavender bg-white px-[clamp(1.25rem,4vw,2.3125rem)] py-[clamp(2rem,5vw,3.1875rem)] shadow-nucleotide">
      <div className="mx-auto w-full max-w-[28.0625rem] text-center">
        <h1 className="font-poppins text-[clamp(1.625rem,1.32rem+0.95vw,2rem)] font-medium leading-[1.04] tracking-[-0.02em] text-nucleotide-ink">
          {content.title}
        </h1>
        <p className="mt-[clamp(0.75rem,1.6vw,1.125rem)] font-poppins text-[clamp(0.875rem,0.76rem+0.52vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-muted">
          {content.description}
        </p>
      </div>

      <form className="mx-auto mt-[clamp(3.25rem,8vw,4.5rem)] w-full max-w-[33.8125rem]" onSubmit={handleSubmit}>
        <label className="block text-center">
          <span className="block font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-normal leading-[1.45] text-nucleotide-ink">
            {content.otpLabel}
          </span>
          <span className="mt-[clamp(0.5rem,1.2vw,0.5625rem)] flex justify-center gap-[clamp(0.5rem,2vw,0.5625rem)]">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                className="aspect-square w-[clamp(3rem,9vw,3.75rem)] rounded-lg border border-nucleotide-lavender bg-white text-center font-poppins text-[clamp(1.25rem,1rem+0.8vw,1.5rem)] font-medium text-nucleotide-ink outline-none transition focus:border-nucleotide-purple focus:ring-4 focus:ring-nucleotide-purple/10"
              />
            ))}
          </span>
        </label>

        <button
          type="submit"
          className="mt-[clamp(0.875rem,2vw,0.9375rem)] flex h-[clamp(3.25rem,7vw,3.625rem)] w-full items-center justify-center gap-[clamp(0.5rem,1.5vw,0.625rem)] rounded-[0.625rem] bg-nucleotide-purple px-[clamp(1rem,4vw,1.25rem)] font-poppins text-[clamp(1rem,0.86rem+0.68vw,1.25rem)] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/25"
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

      <p className="mt-[clamp(0.875rem,2vw,1.125rem)] flex flex-wrap items-center justify-center gap-x-[clamp(0.75rem,3vw,1.1875rem)] gap-y-1 text-center font-poppins text-[clamp(0.875rem,0.76rem+0.52vw,1.25rem)] font-normal leading-[1.45]">
        <span className="text-nucleotide-muted">{content.resendPrompt}</span>
        <a href="/otp-verification" className="font-medium text-nucleotide-night transition hover:text-nucleotide-purple">
          {content.resendLabel}
        </a>
      </p>
    </section>
  );
}
