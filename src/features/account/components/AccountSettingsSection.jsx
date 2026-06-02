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
    <article className="rounded-[1.25rem] border border-nucleotide-lavender bg-white p-[clamp(1rem,2.2vw,1.5rem)] shadow-[0_4px_27.3px_rgba(0,0,0,0.05)]">
      <div className="max-w-[40rem]">
        <h3 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
          {group.title}
        </h3>
        <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-nucleotide-muted">
          {group.description}
        </p>
      </div>

      <div className="mt-[clamp(1rem,2vw,1.25rem)] divide-y divide-nucleotide-lavender/70">
        {group.items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center justify-between gap-4 py-[clamp(0.75rem,1.5vw,1rem)] text-left"
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
  return (
    <section
      className="min-w-0 space-y-[clamp(1.25rem,2.8vw,2rem)] pt-[clamp(1.5rem,3vw,2.5rem)] lg:mt-[clamp(3rem,4.8vw,4.5rem)]"
      aria-label="Settings"
    >
      <div>
        <h2 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.5rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
          Settings
        </h2>
        <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-nucleotide-muted">
          Update account preferences and security controls.
        </p>
      </div>

      <div className="grid gap-[clamp(1rem,2vw,1.25rem)]">
        {settingGroups.map((group) => (
          <SettingsCard key={group.title} group={group} />
        ))}
      </div>

      <article className="rounded-[1.25rem] border border-[#F4C9B2] bg-[#FFF4EF] p-[clamp(1rem,2.2vw,1.5rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-poppins text-[clamp(1rem,0.9rem+0.28vw,1.25rem)] font-medium leading-[1.3] text-nucleotide-ink">
              Delete account
            </h3>
            <p className="mt-2 font-inter text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.5] text-nucleotide-muted">
              Permanently remove your account and saved health data.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-[clamp(2.5rem,3.4vw,2.875rem)] items-center justify-center rounded-lg border border-nucleotide-orange bg-white px-[clamp(1rem,2.5vw,1.5rem)] font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] font-medium text-nucleotide-night transition hover:bg-[#FFE8DD]"
          >
            Delete
          </button>
        </div>
      </article>
    </section>
  );
}
