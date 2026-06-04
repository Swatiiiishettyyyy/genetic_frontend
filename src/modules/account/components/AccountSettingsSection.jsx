import { useState } from "react";
import { DeleteAccountModal } from "./DeleteAccountModal.jsx";

const settingGroups = [
  {
    title: "Notifications",
    description: "Manage booking updates, report alerts, and reminders.",
    items: [
      { label: "Order updates", enabled: true },
      { label: "Report reminders", enabled: true },
      { label: "Health tips", enabled: false },
    ],
  },
  {
    title: "Privacy & Security",
    description: "Control profile access and account protection.",
    items: [
      { label: "Two-step verification", enabled: true },
      { label: "Share reports with family", enabled: false },
    ],
  },
];

function Toggle({ enabled }) {
  return (
    <span
      className={[
        "flex h-[clamp(1.75rem,2.4vw,2rem)] w-[clamp(3rem,4vw,3.25rem)] items-center rounded-full p-1 transition",
        enabled ? "justify-end bg-nucleotide-purple" : "justify-start bg-nucleotide-lavender",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="size-[clamp(1.25rem,1.8vw,1.5rem)] rounded-full bg-white shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.18)]" />
    </span>
  );
}

function SettingsCard({ group }) {
  return (
    <article className="rounded-lg border border-nucleotide-lavender/90 bg-white p-[clamp(1rem,2.2vw,1.5rem)] shadow-[0_0.75rem_2rem_rgba(16,17,41,0.04)]">
      <div className="max-w-[40rem]">
        <h3 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
          {group.title}
        </h3>
        <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-[#5f5f68]">
          {group.description}
        </p>
      </div>

      <div className="mt-[clamp(1rem,2vw,1.25rem)] divide-y divide-nucleotide-lavender/70">
        {group.items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center justify-between gap-4 py-[clamp(0.75rem,1.5vw,1rem)] text-left transition hover:text-nucleotide-purple focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/10"
            aria-pressed={item.enabled}
          >
            <span className="font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-nucleotide-ink">
              {item.label}
            </span>
            <Toggle enabled={item.enabled} />
          </button>
        ))}
      </div>
    </article>
  );
}

export function AccountSettingsSection() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
    <section
      className="min-w-0 space-y-[clamp(1rem,2.5vw,1.75rem)]"
      aria-label="Settings"
    >
      <div>
        <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] text-nucleotide-ink">
          Settings
        </h2>
        <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-[#5f5f68]">
          Update account preferences and security controls.
        </p>
      </div>

      <div className="grid gap-[clamp(1rem,2vw,1.25rem)]">
        {settingGroups.map((group) => (
          <SettingsCard key={group.title} group={group} />
        ))}
      </div>

      <article className="rounded-lg border border-[#F1B99B] bg-[#FFF4EF] p-[clamp(1rem,2.2vw,1.5rem)] shadow-[0_0.75rem_2rem_rgba(234,140,90,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#BA4A18] shadow-[0_0.25rem_0.75rem_rgba(234,140,90,0.12)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-5" fill="none">
                <path d="M12 8v5M12 16.5h.01M10.3 4.8 3.6 17a2 2 0 0 0 1.8 3h13.2a2 2 0 0 0 1.8-3L13.7 4.8a1.95 1.95 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0">
            <h3 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
              Delete account
            </h3>
            <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-[#6f625c]">
              Permanently remove your account and saved health data.
            </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex min-h-[clamp(2.5rem,3.4vw,2.875rem)] items-center justify-center gap-2 rounded-lg border border-nucleotide-orange bg-white px-[clamp(1rem,2.5vw,1.5rem)] font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium text-[#BA4A18] transition hover:bg-[#FFE8DD] focus:outline-none focus:ring-4 focus:ring-nucleotide-orange/20"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete
          </button>
        </div>
      </article>
    </section>

    {deleteOpen && (
      <DeleteAccountModal
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => setDeleteOpen(false)}
      />
    )}
    </>
  );
}
