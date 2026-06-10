import { useState } from "react";

function BackIcon() {
  return (
    <svg className="size-[clamp(0.875rem,1vw,1rem)]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="size-[clamp(1rem,1.4vw,1.25rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z"
        fill="currentColor"
      />
      <circle cx="12" cy="10" r="2" fill="white" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="size-[clamp(0.875rem,1vw,1rem)]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationSummary() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-nucleotide-lavender bg-gradient-to-b from-nucleotide-lavender/70 to-white px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.75rem,1.5vw,0.875rem)]">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-nucleotide-purple text-white">
        <CheckIcon />
      </span>
      <div className="min-w-0">
        <p className="font-poppins text-[clamp(0.9375rem,0.84rem+0.24vw,1.125rem)] font-medium leading-[1.3] text-nucleotide-ink">
          Whitefield, Bengaluru
        </p>
        <p className="font-inter text-[clamp(0.8125rem,0.74rem+0.2vw,0.9375rem)] leading-[1.5] text-nucleotide-muted">
          Karnataka-560066
        </p>
      </div>
    </div>
  );
}

function TextField({ label, placeholder, required }) {
  return (
    <label className="block">
      <span className="mb-[clamp(0.375rem,1vw,0.5rem)] block font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-nucleotide-muted">
        {label}
        {required && " *"}
      </span>
      <input
        className="min-h-[clamp(2.75rem,3.4vw,3.25rem)] w-full rounded-lg border border-nucleotide-lavender bg-white px-[clamp(0.875rem,1.6vw,1rem)] font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-nucleotide-ink outline-none transition placeholder:text-nucleotide-ink focus:border-nucleotide-purple focus:ring-4 focus:ring-nucleotide-purple/10"
        placeholder={placeholder}
        type="text"
      />
    </label>
  );
}

function ChoicePill({ children, selected, compact = false }) {
  return (
    <button
      type="button"
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border border-nucleotide-lavender font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] transition hover:bg-nucleotide-lavender/50",
        compact
          ? "min-h-[clamp(2rem,2.8vw,2.375rem)] px-[clamp(1rem,2.4vw,1.75rem)]"
          : "min-h-[clamp(2.5rem,3.2vw,3rem)] px-[clamp(1.75rem,4vw,3rem)]",
        selected ? "bg-nucleotide-lavender text-nucleotide-ink" : "bg-white text-nucleotide-night",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToggleSwitch() {
  return (
    <button
      type="button"
      className="relative flex h-[2rem] w-[3.25rem] items-center justify-end rounded-full bg-nucleotide-purple p-[0.25rem] shadow-[0_0.25rem_0.5rem_rgba(103,80,164,0.18)] transition focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
      aria-pressed="true"
      aria-label="Set as default address"
    >
      <span className="size-[1.5rem] rounded-full bg-[#FDFDFD] shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.22)]" />
    </button>
  );
}

export function AddAddressModal({ onClose, onConfirm }) {
  const [step, setStep] = useState("location");

  if (step === "details") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-[clamp(1rem,4vw,3rem)] py-[clamp(1rem,4vw,2.5rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-details-title"
      >
        <section className="max-h-[calc(100dvh-3rem)] w-full max-w-[min(34rem,100%)] overflow-y-auto rounded-[1.25rem] bg-white p-[clamp(1rem,2vw,1.5rem)] shadow-nucleotide">
          <button
            type="button"
            className="inline-flex items-center gap-3 font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-[#414141] transition hover:text-nucleotide-purple"
            onClick={() => setStep("location")}
          >
            <BackIcon />
            <span id="address-details-title">Back</span>
          </button>

          <div className="mt-[clamp(0.875rem,2vw,1.25rem)] flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-nucleotide-lavender">
              <div className="h-full w-full rounded-full bg-nucleotide-purple" />
            </div>
            <p className="font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-[#414141]">
              Step 2/2
            </p>
          </div>

          <div className="mt-[clamp(1rem,2.4vw,1.5rem)] space-y-[clamp(1rem,2vw,1.35rem)]">
            <LocationSummary />
            <TextField label="House / Flat / Apartment" placeholder="e.g. Flat 402, Aurum Residency" required />
            <TextField label="Landmark" placeholder="e.g. Opposite Cubbon Park" />

            <fieldset>
              <legend className="mb-[clamp(0.5rem,1.2vw,0.75rem)] font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-nucleotide-muted">
                Save as
              </legend>
              <div className="flex flex-wrap gap-[clamp(0.625rem,1.4vw,0.875rem)]">
                <ChoicePill selected>Home</ChoicePill>
                <ChoicePill>Work</ChoicePill>
                <ChoicePill>Other</ChoicePill>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-[clamp(0.5rem,1.2vw,0.75rem)] font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-nucleotide-muted">
                Linked Profiles
              </legend>
              <div className="flex flex-wrap gap-[clamp(0.5rem,1.2vw,0.75rem)]">
                <ChoicePill compact selected>
                  Self
                </ChoicePill>
                <ChoicePill compact>Wife</ChoicePill>
                <ChoicePill compact>Husband</ChoicePill>
                <ChoicePill compact>Child</ChoicePill>
                <ChoicePill compact>Parent</ChoicePill>
                <ChoicePill compact>Other</ChoicePill>
              </div>
            </fieldset>

            <div className="flex min-h-[clamp(2.75rem,3.4vw,3.25rem)] items-center justify-between gap-4 rounded-lg border border-nucleotide-lavender bg-white px-[clamp(0.875rem,1.6vw,1rem)]">
              <p className="font-inter text-[clamp(0.875rem,0.8rem+0.2vw,1rem)] leading-[1.5] text-nucleotide-ink">
                Set as default address
              </p>
              <ToggleSwitch />
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex min-h-[clamp(2.75rem,3.5vw,3.25rem)] w-full items-center justify-center rounded-lg bg-nucleotide-purple px-4 font-poppins text-[clamp(0.9375rem,0.84rem+0.24vw,1.125rem)] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
            >
              Save Address
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-[clamp(1rem,4vw,3rem)] py-[clamp(1.5rem,5vw,4rem)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-location-title"
    >
      <section className="w-full max-w-[min(23rem,100%)] rounded-[0.875rem] bg-white p-[clamp(1rem,2vw,1.25rem)] shadow-nucleotide">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 font-poppins text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] leading-[1.45] text-nucleotide-ink transition hover:text-nucleotide-purple"
            onClick={onClose}
          >
            <BackIcon />
            <span id="add-location-title">Back</span>
          </button>

          <p className="font-poppins text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] leading-[1.45] text-nucleotide-muted">
            Step 1/2
          </p>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-nucleotide-lavender">
          <div className="h-full w-2/3 rounded-full bg-nucleotide-purple" />
        </div>

        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-[#d7dfdc]">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0_10%,transparent_10%_18%,rgba(255,255,255,0.45)_18%_25%,transparent_25%_100%),linear-gradient(20deg,transparent_0_18%,rgba(127,151,141,0.55)_18%_22%,transparent_22%_100%),linear-gradient(165deg,transparent_0_35%,rgba(127,151,141,0.45)_35%_39%,transparent_39%_100%)]" />
          <div className="absolute left-[8%] top-[18%] h-px w-[86%] rotate-[-8deg] bg-slate-500/35" />
          <div className="absolute left-[3%] top-[58%] h-px w-[94%] rotate-[3deg] bg-slate-500/35" />
          <div className="absolute left-[28%] top-0 h-full w-px rotate-[8deg] bg-slate-500/30" />
          <div className="absolute right-[19%] top-0 h-full w-px rotate-[-12deg] bg-slate-500/30" />

          <div className="absolute left-[6%] top-[8%] rounded-full bg-white/90 px-2 py-1 font-poppins text-[clamp(0.6rem,0.55rem+0.12vw,0.6875rem)] text-nucleotide-ink shadow-sm">
            Drag the pin to select the location
          </div>
          <div className="absolute bottom-[6%] right-[4%] rounded-full bg-white/95 px-2 py-1 font-poppins text-[clamp(0.6rem,0.55rem+0.12vw,0.6875rem)] text-nucleotide-ink shadow-sm">
            Select the current location
          </div>

          <div className="absolute left-1/2 top-1/2 grid size-[clamp(2rem,3vw,2.5rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-nucleotide-purple text-white shadow-[0_0_0_0.5rem_rgba(139,92,246,0.18)]">
            <PinIcon />
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white px-[clamp(0.875rem,1.5vw,1rem)] py-[clamp(0.75rem,1.4vw,0.875rem)] shadow-[0_4px_32px_rgba(136,107,249,0.16)]">
          <p className="font-poppins text-[clamp(0.6875rem,0.62rem+0.18vw,0.75rem)] leading-[1.45] text-nucleotide-muted">
            Detected Location
          </p>
          <p className="mt-2 font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium leading-[1.3] text-nucleotide-ink">
            Whitefield, Bengaluru
          </p>
          <p className="mt-1 font-poppins text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] leading-[1.45] text-nucleotide-muted">
            Karnataka-560066
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStep("details")}
          className="mt-3 inline-flex min-h-[clamp(2.5rem,3.4vw,2.875rem)] w-full items-center justify-center rounded-[0.375rem] bg-nucleotide-purple px-4 font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
        >
          Confirm Location
        </button>
      </section>
    </div>
  );
}
