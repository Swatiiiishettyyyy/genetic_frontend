const supportOptions = [
  {
    title: "Call Support",
    value: "+91 9403891587",
    actionLabel: "Call Now",
    href: "tel:+919403891587",
    type: "phone",
    primary: true,
  },
  {
    title: "Email Support",
    value: "info@nucleotide.life",
    actionLabel: "Email Now",
    href: "mailto:info@nucleotide.life",
    type: "email",
  },
];

function SupportIcon({ type }) {
  const isEmail = type === "email";

  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-nucleotide-lavender/55 text-nucleotide-purple" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        {isEmail ? (
          <path d="M4 6.5h16v11H4v-11ZM5 8l7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7.2 4.8 9.7 4l2 4-1.8 1.3a10.5 10.5 0 0 0 4.8 4.8L16 12.3l4 2-.8 2.5c-.3.9-1.1 1.5-2.1 1.4C10.9 17.7 6.3 13.1 5.8 6.9c-.1-1 .5-1.8 1.4-2.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}

function SupportCard({ option }) {
  const buttonClass = option.primary
    ? "bg-nucleotide-purple text-white hover:bg-[#7447e8] focus:ring-nucleotide-lavender"
    : "border border-nucleotide-purple bg-white text-nucleotide-purple hover:bg-nucleotide-lavender/35 focus:ring-nucleotide-purple/15";

  return (
    <article className="rounded-lg border border-nucleotide-lavender/90 bg-white p-[clamp(1rem,2.2vw,1.5rem)] shadow-[0_0.75rem_2rem_rgba(16,17,41,0.04)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <SupportIcon type={option.type} />
          <div className="min-w-0 font-poppins text-[clamp(0.9375rem,0.82rem+0.28vw,1.125rem)] font-medium leading-[1.3]">
            <p className="text-[#5f5f68]">{option.title}</p>
            <p className="mt-2 break-words text-nucleotide-ink">
              {option.value}
            </p>
          </div>
        </div>

        <a
          href={option.href}
          className={`inline-flex min-h-[clamp(2.625rem,3.2vw,3rem)] shrink-0 items-center justify-center rounded-lg px-[clamp(1.25rem,3vw,2.125rem)] font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium leading-[1.3] transition focus:outline-none focus:ring-4 ${buttonClass}`}
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
      className="min-w-0 space-y-[clamp(1rem,2.5vw,1.75rem)]"
      aria-label="Support"
    >
      <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] text-nucleotide-ink">
        Support
      </h2>

      <div className="grid gap-[clamp(1rem,2vw,1.25rem)] xl:grid-cols-2">
        {supportOptions.map((option) => (
          <SupportCard key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}
