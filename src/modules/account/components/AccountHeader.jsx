import { MobileNavbar } from "../../../shared/components/MobileNavbar.jsx";
import dnaIcon from "../../../shared/assets/navbar/Untitled design (9) 1.png";

export function AccountHeader({ profile, onProfileClick, onMenuClick }) {
  return (
    <header className="relative overflow-hidden border-nucleotide-lavender/70 bg-white text-nucleotide-ink lg:border-b-0 lg:bg-gradient-to-r lg:from-nucleotide-night lg:to-nucleotide-indigo lg:text-white">
      <MobileNavbar onMenuClick={onMenuClick || onProfileClick} className="lg:hidden" />
      <div className="mx-auto flex w-full max-w-[106.25rem] flex-col px-[clamp(0.875rem,4vw,1.5rem)] lg:h-[clamp(10.75rem,12vw,13rem)] lg:px-[clamp(1rem,4vw,5rem)] lg:pb-[clamp(1.375rem,2.2vw,1.875rem)] lg:pt-[clamp(1rem,1.8vw,1.5rem)]">
        <div className="hidden h-full lg:grid lg:grid-rows-[auto_auto_1fr]">
          <a
            href="/"
            aria-label="Nucleotide home"
            className="flex w-fit items-center gap-2 rounded-full transition focus:outline-none focus:ring-4 focus:ring-white/20"
          >
            <img src={dnaIcon} alt="" className="h-[clamp(1.625rem,2vw,2rem)] w-auto object-contain" aria-hidden="true" />
            <span className="font-poppins text-[clamp(1rem,1vw,1.1875rem)] font-medium leading-none text-white">
              Nucleotide
            </span>
          </a>

          <div className="mt-[clamp(0.875rem,1.6vw,1.25rem)] flex items-start justify-between gap-5">
            <a
              href="/dashboard"
              className="flex w-fit items-center gap-2 font-poppins text-[clamp(0.875rem,0.82rem+0.16vw,1rem)] leading-[1.4] text-white transition hover:text-white/85 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                <path d="M12.5 4.5L7 10l5.5 5.5M8 10h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Dashboard
            </a>

            <div className="mr-[clamp(2rem,4vw,5rem)] mt-[clamp(1.875rem,2.4vw,2.25rem)] flex shrink-0 items-center rounded-full bg-white/10 px-[clamp(0.625rem,1vw,0.875rem)] py-[clamp(0.3125rem,0.55vw,0.4375rem)] font-poppins text-[clamp(0.6875rem,0.64rem+0.16vw,0.8125rem)] font-medium leading-none text-white">
              <span className="mr-1 text-white/75">Currently Viewing :</span>
              <span>{profile.name}</span>
              <span className="ml-2 rounded-full bg-nucleotide-purple px-2 py-1 text-[0.6875rem] leading-none text-white">
                {profile.relation}
              </span>
            </div>
          </div>

          <h1 className="ml-[clamp(13.75rem,20vw,23.5rem)] -translate-y-3 self-start font-poppins text-[clamp(1.125rem,1rem+0.36vw,1.375rem)] font-medium leading-[1.2] text-white">
            My Account
          </h1>
        </div>
      </div>
    </header>
  );
}
