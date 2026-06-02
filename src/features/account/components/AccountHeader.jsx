import { BrandLogo } from "../../../components/BrandLogo.jsx";

export function AccountHeader({ profile }) {
  const firstName = profile.name.split(" ")[0] || profile.name;

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-nucleotide-night to-nucleotide-indigo text-white">
      <div className="mx-auto flex min-h-[clamp(14.25rem,22.2vw,28.375rem)] w-full max-w-[128rem] flex-col px-[clamp(1rem,7.8vw,10rem)] py-[clamp(1.5rem,2.45vw,3.125rem)]">
        <div className="flex items-start justify-between gap-[clamp(1rem,4vw,4rem)]">
          <BrandLogo className="h-auto w-[clamp(10rem,14.7vw,18.8125rem)]" />

          <a
            href="/account"
            className="flex shrink-0 items-center gap-[clamp(0.625rem,1.05vw,1.3125rem)] font-poppins text-[clamp(0.875rem,0.58rem+0.45vw,1.25rem)] leading-[1.45] text-white/45 transition hover:text-white focus:outline-none focus:ring-4 focus:ring-white/20"
            aria-label="Open My Account"
          >
            <span className="grid size-[clamp(2.75rem,3.42vw,4.375rem)] place-items-center rounded-full bg-[#FDFDFD] text-[clamp(1rem,0.72rem+0.6vw,1.5rem)] font-medium leading-none tracking-[-0.02em] text-nucleotide-purple">
              {profile.initials}
            </span>
            <span className="hidden whitespace-nowrap sm:inline">My Account</span>
          </a>
        </div>

        <div className="mt-auto max-w-[31.125rem] pb-[clamp(0.875rem,4vw,4.5rem)] text-left">
          <h1 className="font-poppins text-[clamp(1.5rem,1rem+1.1vw,2rem)] font-medium leading-[1.04] tracking-[-0.02em] text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-[clamp(0.5rem,0.7vw,0.875rem)] font-poppins text-[clamp(0.875rem,0.66rem+0.5vw,1.25rem)] leading-[1.45] text-white/45 sm:text-center">
            Explore our health modules and start your journey
          </p>
        </div>
      </div>
    </header>
  );
}
