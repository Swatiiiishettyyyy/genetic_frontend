const supportOptions = [
  {
    title: "Call Support",
    value: "+91 9403891587",
    actionLabel: "Call Now",
    href: "tel:+919403891587",
  },
  {
    title: "Email Support",
    value: "info@nucleotide.life",
    actionLabel: "Call Now",
    href: "mailto:info@nucleotide.life",
  },
];

function SupportCard({ option }) {
  return (
    <article className="rounded-[1.25rem] bg-white p-[clamp(1.25rem,2.8vw,2rem)] shadow-nucleotide">
      <div className="flex flex-col gap-[clamp(1.25rem,3vw,2rem)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 font-poppins text-[clamp(0.9375rem,0.82rem+0.28vw,1.25rem)] font-medium leading-[1.3]">
          <p className="text-nucleotide-muted">{option.title}</p>
          <p className="mt-[clamp(0.75rem,1.6vw,1rem)] break-words text-nucleotide-ink">
            {option.value}
          </p>
        </div>

        <a
          href={option.href}
          className="inline-flex min-h-[clamp(2.75rem,3.6vw,3.625rem)] shrink-0 items-center justify-center rounded-lg bg-nucleotide-purple px-[clamp(1.25rem,3vw,2.125rem)] font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
        >
          {option.actionLabel}
        </a>
      </div>
    </article>
  );
}

export function AccountSupportSection() {
  return (
    <section
      className="min-w-0 space-y-[clamp(1.25rem,2.8vw,2rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Support"
    >
      <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
        Support
      </h2>

      <div className="grid gap-5 xl:grid-cols-2">
        {supportOptions.map((option) => (
          <SupportCard key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}
