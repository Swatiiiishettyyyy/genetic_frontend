import dnaIcon from "../assets/navbar/Untitled design (9) 1.png";
import wordmark from "../assets/navbar/Untitled design (9) 2.png";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.2rem]" fill="none" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.2rem]" fill="none" aria-hidden="true">
      <path d="M6 7h15l-1.5 8.5H8L6 4H3M9 20h.01M18 20h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconButtonClass =
  "relative grid size-10 shrink-0 place-items-center rounded-[0.875rem] border border-nucleotide-lavender/70 bg-white text-nucleotide-night shadow-[0_0.45rem_1.25rem_rgba(139,92,246,0.08)] transition hover:border-nucleotide-purple/35 hover:bg-nucleotide-lavender/35 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15";

export function MobileNavbar({
  onMenuClick,
  backHref,
  backLabel = "Back",
  showActions = true,
  className = "",
}) {
  const leadingButton = backHref ? (
    <a href={backHref} className={iconButtonClass} aria-label={backLabel}>
      <BackIcon />
    </a>
  ) : (
    <button type="button" onClick={onMenuClick} className={`${iconButtonClass} bg-[#FAFAFF]`} aria-label="Open menu">
      <MenuIcon />
    </button>
  );

  return (
    <div className={`sticky top-0 z-40 border-b border-nucleotide-lavender/70 bg-white/95 text-nucleotide-ink shadow-[0_0.75rem_2rem_rgba(22,22,22,0.04)] backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex h-16 w-full max-w-[128rem] items-center justify-between gap-3 px-[clamp(0.875rem,4vw,1.5rem)]">
        {leadingButton}

        <a
          href="/"
          aria-label="Nucleotide home"
          className="mr-auto flex max-w-[10.75rem] min-w-0 items-center gap-1.5 rounded-full px-1 py-1 transition focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
        >
          <img src={dnaIcon} alt="" className="h-[1.05rem] w-auto shrink-0 object-contain" aria-hidden="true" />
          <img src={wordmark} alt="Nucleotide" className="h-[1.9rem] w-auto min-w-0 object-contain" />
        </a>

        {showActions && (
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className={iconButtonClass} aria-label="Notifications">
              <span className="absolute right-2.5 top-2 size-2 rounded-full bg-nucleotide-orange ring-2 ring-white" aria-hidden="true" />
              <BellIcon />
            </button>
            <button type="button" className={iconButtonClass} aria-label="Cart">
              <CartIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
