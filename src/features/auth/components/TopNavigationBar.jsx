import { MobileNavbar } from "../../../components/MobileNavbar.jsx";
import dnaIcon from "../../../assets/navbar/Untitled design (9) 1.png";
import wordmark from "../../../assets/navbar/Untitled design (9) 2.png";

export function TopNavigationBar({ backLabel = "Back", backHref = "/" }) {
  return (
    <>
      <MobileNavbar backHref={backHref} backLabel={backLabel} className="sm:hidden" />
      <header
        className="sticky top-0 z-50 hidden w-full bg-[rgba(249,249,249,0.70)] backdrop-blur-[10px] sm:block"
        style={{ borderBottom: "1px solid rgba(229,229,255,0.5)" }}
      >
        <div className="mx-auto flex h-[clamp(3rem,8vw,4rem)] w-full max-w-[90rem] items-center justify-between px-[clamp(1rem,5vw,7.5rem)]">
          <a
            href={backHref}
            className="inline-flex items-center gap-[clamp(0.375rem,1vw,0.5rem)] rounded-full px-[clamp(0.375rem,1vw,0.5rem)] py-[clamp(0.25rem,0.5vw,0.375rem)] font-inter text-[clamp(0.75rem,0.68rem+0.2vw,0.875rem)] font-semibold tracking-[0.04em] text-nucleotide-night transition hover:bg-nucleotide-lavender/30 focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15"
          >
            <svg
              className="size-[clamp(0.875rem,1.5vw,1rem)] shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8L10 13"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </a>

          <a href="/" aria-label="Nucleotide home" className="flex items-center gap-[clamp(0.375rem,0.8vw,0.5rem)]">
            <img
              src={dnaIcon}
              alt=""
              className="h-[clamp(1.25rem,3vw,1.75rem)] w-auto"
              aria-hidden="true"
            />
            <img
              src={wordmark}
              alt="Nucleotide"
              className="h-[clamp(0.75rem,1.8vw,1.0625rem)] w-auto"
            />
          </a>
        </div>
      </header>
    </>
  );
}
