import { PageShell } from "../components/ui/PageShell.jsx";
import { otpVerificationContent } from "../data/auth.js";
import { AuthDecor } from "../features/auth/components/AuthDecor.jsx";
import { OtpVerificationCard } from "../features/auth/components/OtpVerificationCard.jsx";
import { TopNavigationBar } from "../features/auth/components/TopNavigationBar.jsx";

export function OtpVerificationPage() {
  return (
    <PageShell>
      <div className="relative isolate min-h-dvh overflow-hidden bg-white">
        <div className="pointer-events-none absolute left-[12%] top-[-60%] h-[clamp(32rem,76vw,68.1875rem)] w-[clamp(26rem,58vw,51.6875rem)] rounded-full bg-nucleotide-sea/25 blur-[10.625rem]" />
        <div className="pointer-events-none absolute bottom-[-48%] left-[-32%] h-[clamp(32rem,72vw,64.25rem)] w-[clamp(46rem,104vw,93.5625rem)] rounded-full bg-nucleotide-purple/15 blur-[10.625rem]" />

        <TopNavigationBar backLabel={otpVerificationContent.backLabel} backHref="/" />

        <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col px-[clamp(1rem,7vw,9.5625rem)] py-[clamp(1.5rem,5vw,4.8125rem)]">

          <div className="grid flex-1 items-center gap-[clamp(2rem,7vw,5rem)] py-[clamp(2rem,6vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,38.625rem)]">
            <AuthDecor />

            <div className="mx-auto w-full max-w-[38.625rem] lg:mx-0">
              <OtpVerificationCard content={otpVerificationContent} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
