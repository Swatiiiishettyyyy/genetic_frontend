import { Avatar } from "../../../components/ui/Avatar.jsx";
import { cn } from "../../../lib/cn.js";

function EditIcon() {
  return (
    <svg className="size-[clamp(1.125rem,2vw,1.5rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4.25L19 9.25 14.75 5 4 15.75V20Z" fill="currentColor" />
      <path d="M16 3.75 20.25 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="size-[clamp(1.125rem,2vw,1.5rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12l-.8 13H6.8L6 7Z" fill="currentColor" />
      <path d="M9 5h6m-8 2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg className="size-[clamp(1rem,2vw,1.25rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg className="size-[clamp(1rem,2vw,1.25rem)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FamilyProfileCard({ member }) {
  return (
    <article
      className={cn(
        "flex min-h-[clamp(8.5rem,12vw,10rem)] flex-col justify-between rounded-[20px] bg-white p-[clamp(0.875rem,1.5vw,1.125rem)] shadow-nucleotide",
        member.currentlyViewing && "border border-nucleotide-purple",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-[clamp(1rem,1.8vw,1.375rem)]">
          <Avatar initials={member.initials} className="size-[clamp(3.25rem,4.6vw,4rem)] text-[clamp(1.25rem,1rem+0.7vw,1.5rem)]" />
          <div className="min-w-0">
            <h2 className="truncate font-poppins text-[clamp(1.0625rem,0.94rem+0.42vw,1.25rem)] font-medium leading-[1.2] tracking-[-0.02em] text-nucleotide-ink">
              {member.name}
            </h2>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.4]">
              <span className="text-nucleotide-muted">
                {member.relation} . {member.status}
              </span>
              <span className="text-nucleotide-night">{member.age}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[clamp(0.5rem,1.2vw,0.75rem)] text-nucleotide-purple">
          <button type="button" aria-label={`Edit ${member.name}`} className="transition hover:text-[#7447e8]">
            <EditIcon />
          </button>
          <button type="button" aria-label={`Delete ${member.name}`} className="transition hover:text-[#7447e8]">
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {member.currentlyViewing ? (
          <p className="inline-flex items-center gap-2 font-poppins text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.4] text-nucleotide-sea">
            <CheckIcon />
            Currently Viewing
          </p>
        ) : (
          <button
            type="button"
            className="inline-flex h-[clamp(2.5rem,3.5vw,2.875rem)] min-w-[clamp(7rem,11vw,8.75rem)] items-center justify-center gap-2 rounded-lg border border-nucleotide-purple px-[clamp(0.875rem,2vw,1.25rem)] font-poppins text-[clamp(0.9375rem,0.84rem+0.34vw,1rem)] font-medium leading-[1.3] text-nucleotide-night transition hover:bg-nucleotide-lavender/50"
          >
            Switch
            <SwitchIcon />
          </button>
        )}
      </div>
    </article>
  );
}
