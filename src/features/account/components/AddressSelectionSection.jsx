const savedAddress = {
  label: "Home",
  badges: ["Default"],
  line1: "123 Main Street, Apartment 4B",
  line2: "Mumbai, Maharashtra - 400001",
  phone: "+91 9768767765",
  members: ["Wife", "Self"],
};

function RadioMark() {
  return (
    <span className="grid size-[clamp(2.25rem,3vw,3rem)] shrink-0 place-items-center rounded-full">
      <span className="grid size-5 place-items-center rounded-full border-2 border-nucleotide-purple">
        <span className="size-2.5 rounded-full bg-nucleotide-purple" />
      </span>
    </span>
  );
}

export function AddressSelectionSection({ onAddAddress }) {
  return (
    <section
      className="min-w-0 space-y-[clamp(1rem,2.2vw,1.5rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Address"
    >
      <div className="flex flex-col gap-[clamp(1rem,2vw,1.25rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
            Address
          </h2>

          <button
            type="button"
            onClick={onAddAddress}
            className="inline-flex min-h-[clamp(2.75rem,3.6vw,3.625rem)] items-center justify-center rounded-lg bg-nucleotide-purple px-[clamp(1.25rem,3.2vw,2.125rem)] font-poppins text-[clamp(0.9375rem,0.82rem+0.34vw,1.25rem)] font-medium leading-[1.3] text-white shadow-sm transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender sm:w-auto"
          >
            Add New Address
          </button>
        </div>

        <h3 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
          Select Collection Address
        </h3>
      </div>

      <article className="rounded-[1.25rem] border border-nucleotide-lavender bg-white p-[clamp(1rem,2vw,1.25rem)] shadow-[0_4px_27.3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.25rem)] lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-[clamp(0.75rem,1.5vw,1rem)]">
            <RadioMark />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-[clamp(1rem,2vw,1.5rem)] gap-y-2">
                <h4 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
                  {savedAddress.label}
                </h4>
                {savedAddress.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex min-h-6 items-center justify-center rounded-full border border-nucleotide-lavender bg-nucleotide-lavender px-3 font-inter text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] leading-[1.3] text-nucleotide-purple"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-[clamp(0.75rem,1.6vw,1rem)] font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5]">
                <p className="text-nucleotide-muted">{savedAddress.line1}</p>
                <p className="text-nucleotide-muted">{savedAddress.line2}</p>
                <p className="mt-1 text-nucleotide-night">{savedAddress.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {savedAddress.members.map((member) => (
              <span
                key={member}
                className="inline-flex min-h-6 items-center justify-center rounded-full border border-nucleotide-orange bg-[#FFF4EF] px-4 font-inter text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] leading-[1.3] text-nucleotide-night"
              >
                {member}
              </span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
