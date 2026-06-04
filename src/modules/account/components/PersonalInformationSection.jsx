import { useState } from "react";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { EditProfileModal } from "./EditProfileModal.jsx";
import { dashboardIcons } from "../../../shared/assets/dashboardIcons.js";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const RELATIONSHIP_OPTIONS = ["Self", "Wife", "Husband", "Child", "Parent", "Other"];

function FieldCard({ label, children }) {
  return (
    <div className="w-full rounded-xl bg-[#F9F9F9] px-5 py-4 shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.035)] ring-1 ring-[rgba(203,195,215,0.18)]">
      <p className="font-inter text-[0.75rem] font-semibold uppercase leading-[1.35] tracking-[0.05em] text-[#494454]">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ReadInput({ value, placeholder }) {
  return (
    <div className="flex min-h-[2.875rem] w-full items-center rounded-xl bg-[#F4F4F6] px-4 py-3 ring-1 ring-black/[0.03]">
      <span className="font-inter text-[1rem] leading-normal text-[#6B7280]">
        {value || <span className="text-[#9CA3AF]">{placeholder}</span>}
      </span>
    </div>
  );
}

function GenderToggle({ value, onChange }) {
  return (
    <div className="flex h-10 gap-0 rounded-lg bg-[#F4F4F6] p-1 ring-1 ring-black/[0.03]">
      {GENDER_OPTIONS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={[
            "flex flex-1 items-center justify-center rounded font-poppins text-[0.75rem] leading-[1.35] transition-all",
            value === g
              ? "rounded-[0.25rem] bg-nucleotide-purple text-white shadow-[0_0.25rem_0.375rem_rgba(109,59,215,0.2)]"
              : "text-[#494454] hover:bg-nucleotide-lavender/40",
          ].join(" ")}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function RelationshipSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[2.875rem] w-full items-center justify-between rounded-xl bg-[#F4F4F6] px-4 py-3 ring-1 ring-black/[0.03]"
      >
        <span className="font-inter text-[1rem] leading-6 text-[#1A1C1C]">{value}</span>
        <span className="size-[1.5rem] text-[#6B7280]">
          <svg viewBox="0 0 24 24" fill="none" className="size-full">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 overflow-hidden rounded-xl bg-white shadow-[0_0.5rem_2rem_rgba(136,107,249,0.18)]">
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={[
                "w-full px-4 py-2.5 text-left font-inter text-[1rem] leading-[1.4] transition-colors",
                opt === value
                  ? "bg-nucleotide-lavender text-nucleotide-ink"
                  : "bg-white text-nucleotide-ink hover:bg-nucleotide-lavender/40",
              ].join(" ")}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BirthdateInput({ value, onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder="DD / MM / YYYY"
        onChange={(e) => onChange(e.target.value)}
        className="h-[2.875rem] w-full rounded-xl bg-[#F4F4F6] px-4 pr-12 font-inter text-[1rem] leading-normal text-[#6B7280] outline-none ring-1 ring-black/[0.03] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-nucleotide-purple/30"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2 opacity-50">
        <img src={dashboardIcons.calendar} alt="" className="size-full object-contain" />
      </span>
    </div>
  );
}

/* ── Desktop read-only tile ─────────────────────────────────────────── */
function InfoTile({ label, value, icon }) {
  return (
    <div className="flex min-h-[5.25rem] items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[0_0.75rem_2.5rem_rgba(139,92,246,0.07)] ring-1 ring-nucleotide-lavender/25">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-nucleotide-lavender/70">
        <img src={icon} alt="" className="size-5 object-contain" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-poppins text-[0.8125rem] font-normal leading-[1.35] text-nucleotide-muted">
          {label}
        </p>
        <p className="mt-1 break-words font-poppins text-[0.9375rem] font-medium leading-[1.35] text-nucleotide-ink">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export function PersonalInformationSection({ profile }) {
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState({
    name:      profile.name,
    email:     profile.email,
    phone:     profile.phone,
    birthdate: profile.birthdate,
    gender:    profile.gender,
    relation:  profile.relation,
  });

  function handleSave(draft) {
    setData({
      name:      draft.name,
      email:     draft.email,
      phone:     draft.phone,
      birthdate: draft.birthdate,
      gender:    draft.gender,
      relation:  draft.relationship,
    });
  }

  const isSelf = data.relation === "Self";

  return (
    <>
      {/* ── Mobile layout (matches Figma node 40000308:4651) ── */}
      <section
        className="flex flex-col gap-3 pb-10 pt-4 lg:hidden"
        aria-label="Personal Information"
      >
        {/* Profile avatar section */}
        <div className="relative flex justify-center">
          <div className="relative">
            <Avatar
              initials={profile.initials}
              size="lg"
              className="size-[5.125rem] bg-white text-[1.75rem] font-medium text-nucleotide-purple shadow-[0_0.5rem_0.875rem_-0.1875rem_rgba(0,0,0,0.1),0_0.25rem_0.375rem_-0.25rem_rgba(0,0,0,0.1)] ring-4 ring-[#F9F9F9]"
            />
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full bg-nucleotide-purple text-white shadow-[0_0.35rem_0.9rem_rgba(139,92,246,0.35)] ring-2 ring-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
              aria-label="Edit profile photo"
            >
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="size-3.5">
                <path d="M2 10.5V12h1.5l5.25-5.25-1.5-1.5L2 10.5ZM12.5 3.25a1 1 0 0 0 0-1.41L11.16.5a1 1 0 0 0-1.41 0L8.66 1.59l1.75 1.75 2.09-2.09Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <FieldCard label="Full Name">
          <ReadInput value={data.name} placeholder="Enter full name" />
        </FieldCard>

        {/* Email */}
        <FieldCard label="Email Address">
          <ReadInput value={data.email} placeholder="Enter email" />
        </FieldCard>

        {/* Phone */}
        <FieldCard label="Phone Number">
          <ReadInput value={data.phone} placeholder="+1 (555) 000-0000" />
        </FieldCard>

        {/* Relationship */}
        <FieldCard label="Relationship">
          {isSelf ? (
            <div className="flex h-[2.875rem] w-full items-center justify-between rounded-xl bg-[#F4F4F6] px-4 py-3 opacity-75 ring-1 ring-black/[0.03]">
              <span className="font-inter text-[1rem] leading-6 text-[#1A1C1C]">Self</span>
              <span className="size-6 text-[#6B7280]">
                <svg viewBox="0 0 24 24" fill="none" className="size-full">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          ) : (
            <RelationshipSelect value={data.relation} onChange={(v) => setData((d) => ({ ...d, relation: v }))} />
          )}
        </FieldCard>

        {/* Birthdate */}
        <FieldCard label="Birthdate">
          <BirthdateInput
            value={data.birthdate}
            onChange={(v) => setData((d) => ({ ...d, birthdate: v }))}
          />
        </FieldCard>

        {/* Gender */}
        <FieldCard label="Gender">
          <GenderToggle
            value={data.gender}
            onChange={(v) => setData((d) => ({ ...d, gender: v }))}
          />
        </FieldCard>

        {/* Save button */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-nucleotide-purple px-5 font-poppins text-[1rem] font-medium leading-[1.3] text-white shadow-[0_0.75rem_1.5rem_rgba(139,92,246,0.2)] transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
        >
          Edit Profile
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
            <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* ── Desktop layout (unchanged) ── */}
      <section
        className="hidden w-full max-w-[64rem] flex-col gap-4 pb-5 lg:flex"
        aria-label="Personal Information"
      >
        <article className="flex min-h-[6.875rem] items-center justify-between gap-6 rounded-xl bg-white px-8 py-5 shadow-[0_0.75rem_2.5rem_rgba(139,92,246,0.07)] ring-1 ring-nucleotide-lavender/25">
          <div className="flex min-w-0 items-center gap-5">
            <Avatar
              initials={profile.initials}
              size="lg"
              className="size-14 bg-nucleotide-lavender/70 text-[1.25rem] shadow-none ring-0"
            />

            <div className="min-w-0">
              <p className="truncate font-poppins text-[1.125rem] font-medium leading-[1.3] text-nucleotide-ink">
                {data.name}
              </p>
              <p className="mt-1 font-poppins text-[0.9375rem] font-normal leading-[1.4] text-nucleotide-muted">
                {data.relation} . Active Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-nucleotide-purple px-5 font-poppins text-[0.875rem] font-medium leading-[1.3] text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender"
          >
            Edit Profile
          </button>
        </article>

        <div className="grid gap-4 xl:grid-cols-2">
          <InfoTile label="Email" value={data.email} icon={dashboardIcons.email} />
          <InfoTile label="Phone" value={data.phone} icon={dashboardIcons.phone} />
          <InfoTile label="Birthdate" value={data.birthdate} icon={dashboardIcons.calendar} />
          <InfoTile label="Gender" value={data.gender} icon={dashboardIcons.person} />
        </div>
      </section>

      {editOpen && (
        <EditProfileModal
          profile={{ ...profile, ...data, relation: data.relation }}
          lockRelationship={isSelf}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
