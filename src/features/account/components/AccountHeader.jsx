import { MobileNavbar } from "../../../components/MobileNavbar.jsx";

export function AccountHeader({ profile, onProfileClick, onMenuClick }) {
  return (
    <header className="relative overflow-hidden border-nucleotide-lavender/70 bg-white text-nucleotide-ink lg:border-b-0 lg:bg-gradient-to-r lg:from-nucleotide-night lg:to-nucleotide-indigo lg:text-white">
      <MobileNavbar onMenuClick={onMenuClick || onProfileClick} className="lg:hidden" />
      <div className="mx-auto flex w-full max-w-[128rem] flex-col px-[clamp(0.875rem,4vw,1.5rem)] lg:min-h-[clamp(9.5rem,14vw,16.5rem)] lg:px-[clamp(1rem,7.8vw,10rem)] lg:py-[clamp(1.25rem,2.45vw,3.125rem)]">
        <div className="hidden flex-col gap-[clamp(0.4rem,1.6vw,0.85rem)] pb-3 pt-2 lg:mt-auto lg:flex lg:gap-[clamp(1.125rem,2.5vw,2rem)] lg:pb-[clamp(0.75rem,2.5vw,2rem)] lg:pt-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-[clamp(1rem,1.8vw,1.5rem)]">
            <a
              href="/"
              className="hidden w-fit items-center gap-2 font-poppins text-[clamp(0.875rem,0.76rem+0.28vw,1rem)] leading-[1.45] text-white/80 transition hover:text-white focus:outline-none focus:ring-4 focus:ring-white/20 lg:flex"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                <path d="M12.5 4.5L7 10l5.5 5.5M8 10h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Dashboard
            </a>

            <h1 className="font-poppins text-[clamp(1.5rem,1.08rem+0.9vw,2rem)] font-medium leading-[1.04] text-nucleotide-ink lg:text-white">
              My Account
            </h1>
          </div>

          <div className="hidden items-center rounded-full bg-white/10 px-[clamp(0.75rem,1.2vw,1rem)] py-[clamp(0.375rem,0.75vw,0.5rem)] font-poppins text-[clamp(0.75rem,0.66rem+0.22vw,0.875rem)] font-medium leading-none text-white lg:flex">
            <span className="mr-1 text-white/75">Currently Viewing :</span>
            <span>{profile.name}</span>
            <span className="ml-2 rounded-full bg-nucleotide-purple px-2 py-1 text-[0.6875rem] leading-none text-white">
              {profile.relation}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
