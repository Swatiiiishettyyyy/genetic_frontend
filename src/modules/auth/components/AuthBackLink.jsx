export function AuthBackLink({ label }) {
  return (
    <a
      href="/"
      className="inline-flex items-center gap-3 font-poppins text-fluid-xs font-medium text-nucleotide-night"
    >
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 19L8 12L15 5"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </a>
  );
}
