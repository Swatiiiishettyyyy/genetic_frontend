import { useEffect, useRef, useState } from "react";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { dashboardIcons } from "../../../shared/assets/dashboardIcons.js";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const RELATIONSHIP_OPTIONS = ["Wife", "Husband", "Child", "Parent", "Other"];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-full">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 7" fill="none" aria-hidden="true" className="size-full">
      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditPenIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="size-full">
      <path d="M2 10.5V12h1.5l5.25-5.25-1.5-1.5L2 10.5ZM12.5 3.25a1 1 0 0 0 0-1.41L11.16.5a1 1 0 0 0-1.41 0L8.66 1.59l1.75 1.75 2.09-2.09Z" fill="currentColor" />
    </svg>
  );
}

const labelCls = "font-inter text-[0.6875rem] font-semibold uppercase leading-[1.35] tracking-[0.08em] text-[#4F4B5D] sm:font-poppins sm:text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)] sm:font-normal sm:normal-case sm:tracking-normal sm:text-nucleotide-muted";
const inputCls = "h-9 w-full rounded-lg border border-transparent bg-[#F3F3F3] px-3 font-poppins text-[0.8125rem] text-nucleotide-ink outline-none transition placeholder:text-[#8C8A94] focus:border-nucleotide-purple focus:ring-2 focus:ring-nucleotide-lavender sm:h-[clamp(2.5rem,3.2vw,2.875rem)] sm:border-nucleotide-lavender sm:bg-white sm:text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] sm:placeholder:text-nucleotide-muted/40";

function FormField({ label, id, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="rounded-xl bg-white p-4 sm:rounded-none sm:bg-transparent sm:p-0">
      <label htmlFor={id} className={labelCls}>
        {label}{required && " *"}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-2 sm:mt-1"}
      />
    </div>
  );
}

function RelationshipDropdown({ value, onChange, isSelf }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  if (isSelf) {
    return (
      <div className="rounded-xl bg-white p-4 sm:rounded-none sm:bg-transparent sm:p-0">
        <span className={labelCls}>Relationship *</span>
        <div className={inputCls + " mt-2 flex cursor-not-allowed items-center justify-between opacity-80 sm:mt-1 sm:opacity-50"}>
          <span>Self</span>
          <span className="size-3 text-nucleotide-muted sm:hidden">
            <ChevronIcon />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl bg-white p-4 sm:rounded-none sm:bg-transparent sm:p-0" ref={ref}>
      <label className={labelCls}>Relationship *</label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={inputCls + " mt-2 flex items-center justify-between pr-3 text-left sm:mt-1"}
      >
        <span>{value}</span>
        <span className={["size-[0.625rem] text-nucleotide-muted transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 overflow-hidden rounded-[0.875rem] bg-white shadow-[0_8px_32px_rgba(136,107,249,0.18)]">
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={[
                "w-full px-4 py-2 text-left font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] leading-[1.4] transition-colors",
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

function GenderPills({ value, onChange }) {
  return (
    <div className="rounded-xl bg-white p-4 sm:rounded-none sm:bg-transparent sm:p-0">
      <span className={labelCls}>Gender</span>
      <div className="mt-2 flex rounded-lg bg-[#F3F3F3] p-0.5 sm:mt-1 sm:gap-2 sm:bg-transparent sm:p-0">
        {GENDER_OPTIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={[
              "h-8 flex-1 rounded-md font-poppins text-[0.6875rem] transition sm:h-[clamp(2.5rem,3.2vw,2.875rem)] sm:rounded-lg sm:text-[clamp(0.875rem,0.78rem+0.24vw,1rem)]",
              value === g
                ? "bg-nucleotide-purple text-white"
                : "text-nucleotide-night hover:bg-nucleotide-lavender/60 sm:bg-nucleotide-lavender",
            ].join(" ")}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function BirthDateField({ value, onChange }) {
  return (
    <div className="rounded-xl bg-white p-4 sm:rounded-none sm:bg-transparent sm:p-0">
      <label htmlFor="modal-birthdate" className={labelCls}>Birth Date *</label>
      <div className="relative">
        <input
          id="modal-birthdate"
          type="text"
          value={value}
          placeholder="dd/mm/yyyy"
          onChange={(e) => onChange(e.target.value)}
          className={inputCls + " mt-2 pr-10 sm:mt-1"}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 opacity-40">
          <img src={dashboardIcons.calendar} alt="" className="size-full object-contain" />
        </span>
      </div>
    </div>
  );
}

export function EditProfileModal({ profile, mode = "edit", lockRelationship = false, onClose, onSave }) {
  const isAdd = mode === "add";
  const isSelf = lockRelationship;

  const [draft, setDraft] = useState({
    name:         profile?.name      ?? "",
    email:        profile?.email     ?? "",
    phone:        profile?.phone     ?? "",
    relationship: isSelf ? "Self" : (profile?.relation ?? RELATIONSHIP_OPTIONS[0]),
    gender:       profile?.gender    ?? "Male",
    birthdate:    profile?.birthdate ?? "",
  });

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

  function handleSubmit(e) {
    e.preventDefault();
    onSave(draft);
    onClose();
  }

  function set(key) {
    return (val) => setDraft((d) => ({ ...d, [key]: val }));
  }

  const initials = isAdd
    ? draft.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"
    : (profile?.initials ?? "?");

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F5F0FF] sm:flex sm:items-center sm:justify-center sm:bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isAdd ? "Add Family Member" : "Edit Profile"}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="h-full w-full overflow-y-auto bg-[#F5F0FF] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-[30rem] sm:rounded-[1.25rem] sm:bg-white sm:p-[clamp(1.25rem,2.5vw,1.75rem)] sm:shadow-nucleotide">
        <form onSubmit={handleSubmit} className="flex min-h-full flex-col sm:block sm:min-h-0">
          <div className="flex h-14 shrink-0 items-center bg-white px-4 sm:hidden">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="grid size-9 place-items-center rounded-full text-nucleotide-night transition hover:bg-nucleotide-lavender/40"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="flex-1 pr-9 text-center font-poppins text-[1rem] font-medium leading-[1.35] text-nucleotide-night">
              Personal Information
            </h2>
          </div>

          <div className="relative flex items-start justify-center px-4 pb-3 pt-8 sm:px-0 sm:pb-0 sm:pt-0">
            <div className="relative inline-block">
              <Avatar
                initials={initials}
                size="sm"
                className="size-[4.375rem] bg-white text-[1rem] shadow-[0_0.5rem_1.5rem_rgba(16,17,41,0.08)] ring-4 ring-white sm:size-[clamp(3.5rem,5vw,4.375rem)] sm:text-[clamp(1.125rem,1.5vw,1.5rem)] sm:ring-0"
              />
              <span className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full bg-nucleotide-purple p-[0.1875rem] text-white shadow-sm">
                <EditPenIcon />
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-0 top-0 hidden size-5 shrink-0 text-nucleotide-muted transition hover:text-nucleotide-ink sm:block"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3 sm:mt-4 sm:flex-none sm:p-0">
            <FormField label="Full Name" id="modal-name"  value={draft.name}  onChange={set("name")}  required />
            <FormField label="Email Address" id="modal-email" type="email" value={draft.email} onChange={set("email")} />
            <FormField label="Phone Number" id="modal-phone" type="tel"  value={draft.phone} onChange={set("phone")} required />
            <RelationshipDropdown value={draft.relationship} onChange={set("relationship")} isSelf={isSelf} />
            <BirthDateField value={draft.birthdate} onChange={set("birthdate")} />
            <GenderPills value={draft.gender} onChange={set("gender")} />
          </div>

          <div className="mt-auto flex items-center justify-center gap-6 bg-white px-4 py-4 sm:mt-5 sm:bg-transparent sm:p-0">
            <button
              type="button"
              onClick={onClose}
              className="hidden font-poppins text-[clamp(0.875rem,0.78rem+0.24vw,1rem)] text-nucleotide-ink transition hover:text-nucleotide-muted sm:block"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-nucleotide-purple px-5 font-poppins text-[1rem] font-medium text-white transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-lavender sm:h-[clamp(2.5rem,3.2vw,2.875rem)] sm:w-auto sm:rounded-lg sm:px-[clamp(1.25rem,2.5vw,1.75rem)] sm:text-[clamp(0.875rem,0.78rem+0.24vw,1rem)]"
            >
              {isAdd ? "Add Member" : "Update Profile"}
              <svg viewBox="0 0 20 20" className="size-5 sm:hidden" fill="none" aria-hidden="true">
                <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
