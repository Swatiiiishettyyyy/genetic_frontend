import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";

function EditIcon() {
  return (
    <svg className="size-[clamp(1rem,1.2vw,1.125rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4.25L19 9.25 14.75 5 4 15.75V20Z" fill="currentColor" />
      <path d="M16 3.75 20.25 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="size-[clamp(1rem,1.2vw,1.125rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12l-.8 13H6.8L6 7Z" fill="currentColor" />
      <path d="M9 5h6m-8 2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg className="size-[clamp(0.875rem,1.1vw,1rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7h10m0 0-3-3m3 3-3 3M17 17H7m0 0 3 3m-3-3 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="size-[clamp(0.875rem,1.1vw,1rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FamilyProfileCard({ member, onEdit }) {
  return (
    <article
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border border-white/80 bg-white px-3 py-4 shadow-[0_0.75rem_2.25rem_rgba(139,92,246,0.1)] sm:min-h-[clamp(7rem,9vw,8rem)] sm:gap-0 sm:rounded-[0.875rem] sm:p-[clamp(0.875rem,1.4vw,1rem)] sm:shadow-nucleotide",
        member.currentlyViewing && "border-nucleotide-purple/50 bg-white ring-1 ring-nucleotide-purple/25",
      )}
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-[clamp(0.75rem,1.4vw,1rem)]">
          <div className="size-10 shrink-0 sm:size-[clamp(2.75rem,3.6vw,3.25rem)]">
            <Avatar initials={member.initials} size="sm" className="!size-full text-[0.875rem] sm:text-[clamp(1rem,0.86rem+0.42vw,1.25rem)]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-poppins text-[0.9375rem] font-medium leading-[1.3] text-nucleotide-ink sm:text-[clamp(1rem,0.9rem+0.28vw,1.125rem)] sm:leading-[1.3]">
              {member.name}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-inter text-[0.75rem] leading-[1.35] text-nucleotide-muted sm:gap-x-2.5 sm:text-[clamp(0.8125rem,0.76rem+0.2vw,0.9375rem)] sm:leading-[1.5]">
              <span>
                {member.relation} · {member.status}
              </span>
              <span className="rounded-full bg-nucleotide-lavender/45 px-2 py-0.5 font-medium text-nucleotide-night sm:bg-transparent sm:px-0 sm:py-0 sm:font-normal">{member.age}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-nucleotide-purple sm:gap-[clamp(0.5rem,1.2vw,0.75rem)]">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${member.name}`}
            className="grid size-7 place-items-center rounded-full bg-nucleotide-lavender/35 transition hover:bg-nucleotide-lavender/50 hover:text-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15 sm:size-auto sm:rounded-none sm:bg-transparent sm:hover:bg-transparent"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            aria-label={`Delete ${member.name}`}
            className="grid size-7 place-items-center rounded-full bg-nucleotide-lavender/35 transition hover:bg-nucleotide-lavender/50 hover:text-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15 sm:size-auto sm:rounded-none sm:bg-transparent sm:hover:bg-transparent"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className="flex justify-end border-t border-nucleotide-lavender/40 pt-3 sm:border-t-0 sm:pt-0">
        {member.currentlyViewing ? (
          <p className="inline-flex w-full items-center justify-start gap-1.5 font-inter text-[0.75rem] font-medium leading-[1.4] text-nucleotide-sea sm:w-auto sm:text-[clamp(0.8125rem,0.76rem+0.2vw,0.9375rem)] sm:font-normal sm:leading-[1.5]">
            <CheckIcon />
            Currently Viewing
          </p>
        ) : (
          <button
            type="button"
            className="inline-flex h-8 w-full min-w-[clamp(6rem,9vw,7rem)] items-center justify-center gap-2 rounded-lg border border-nucleotide-purple/70 bg-white px-4 font-poppins text-[0.75rem] font-semibold leading-[1.3] text-nucleotide-night transition hover:bg-nucleotide-lavender/50 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15 sm:h-[clamp(2.25rem,3vw,2.5rem)] sm:w-auto sm:px-[clamp(0.875rem,1.6vw,1rem)] sm:text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] sm:font-medium"
          >
            Switch
            <SwitchIcon />
          </button>
        )}
      </div>
    </article>
  );
}
