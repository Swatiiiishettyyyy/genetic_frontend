import { useEffect } from "react";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 32" fill="none" aria-hidden="true" className="size-full">
      <path d="M3 8h18l-1.5 19.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 8Z" fill="white" />
      <path d="M8 3h8M1 8h22" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9.5 13v8M14.5 13v8" stroke="#101129" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DeleteAccountModal({ onClose, onConfirm }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[clamp(18rem,44vw,26rem)] overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-white to-nucleotide-lavender shadow-nucleotide">

        {/* Body */}
        <div className="flex flex-col items-center px-[clamp(1.25rem,4vw,2rem)] pb-[clamp(1.5rem,3vw,2rem)] pt-[clamp(1.75rem,3.5vw,2.25rem)] text-center">

          {/* Icon circle */}
          <div className="flex size-[clamp(4rem,7vw,5.5rem)] items-center justify-center rounded-full bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo p-[clamp(0.875rem,1.5vw,1.25rem)]">
            <TrashIcon />
          </div>

          {/* Title */}
          <h2
            id="delete-modal-title"
            className="mt-[clamp(1rem,2vw,1.5rem)] font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink"
          >
            Delete Your Account?
          </h2>

          {/* Description */}
          <p className="mt-2 font-inter text-[clamp(0.8125rem,0.76rem+0.2vw,0.9375rem)] leading-[1.5] text-nucleotide-muted">
            This will permanently delete your account and all associated data, including your reports, history, and personal information. This action cannot be undone.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-nucleotide-lavender/60" />

        {/* Actions */}
        <div className="flex items-center gap-[clamp(1.5rem,4vw,3rem)] px-[clamp(1.25rem,4vw,2rem)] py-[clamp(1rem,2vw,1.375rem)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.4] text-nucleotide-night transition hover:text-nucleotide-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[clamp(2.5rem,3.4vw,2.875rem)] flex-[2] items-center justify-center rounded-lg bg-nucleotide-purple font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}
