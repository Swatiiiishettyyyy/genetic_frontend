import { dashboardIcons } from "../../../assets/dashboardIcons.js";

export function AddressEmptyState({ onAddAddress }) {
  return (
    <section
      className="min-w-0 space-y-[clamp(1.75rem,3vw,2.5rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Address"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
          Address
        </h2>

        <button
          type="button"
          onClick={onAddAddress}
          className="inline-flex min-h-[clamp(2.75rem,3.6vw,3.625rem)] items-center justify-center rounded-lg bg-nucleotide-purple px-[clamp(1.25rem,3.2vw,2.125rem)] font-poppins text-[clamp(0.9375rem,0.82rem+0.34vw,1.25rem)] font-medium leading-[1.3] text-white shadow-sm transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender sm:w-auto"
        >
          Add Address
        </button>
      </div>

      <div className="flex min-h-[clamp(8rem,13vw,14rem)] items-center justify-center rounded-[1.25rem] bg-white px-[clamp(1rem,4vw,3rem)] py-[clamp(1.5rem,4vw,2.25rem)] shadow-nucleotide">
        <div className="mx-auto flex w-full max-w-[42rem] flex-col items-center text-center">
          <div className="grid size-[clamp(3rem,4.6vw,4.9375rem)] place-items-center rounded-full bg-gradient-to-t from-nucleotide-lavender to-white">
            <img
              src={dashboardIcons.address}
              alt=""
              className="size-[clamp(1.125rem,1rem+0.4vw,1.5rem)] object-contain"
              aria-hidden="true"
            />
          </div>

          <h3 className="mt-[clamp(0.75rem,1.4vw,1.125rem)] font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
            No addresses yet
          </h3>
          <p className="mt-1 max-w-[38rem] font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1.25rem)] leading-[1.45] text-nucleotide-muted">
            Add an address to use it for sample collection or deliveries.
          </p>
        </div>
      </div>
    </section>
  );
}
