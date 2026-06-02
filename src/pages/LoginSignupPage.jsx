import { PageShell } from "../components/ui/PageShell.jsx";
import { loginSignupContent } from "../data/auth.js";
import { AuthCard } from "../features/auth/components/AuthCard.jsx";

export function LoginSignupPage() {
  return (
    <PageShell>
      <div className="grid min-h-dvh place-items-center overflow-hidden bg-white px-[clamp(1rem,4vw,3rem)] py-[clamp(1.25rem,5vw,4rem)]">
        <div className="w-full max-w-[clamp(20rem,66vw,38.625rem)]">
          <AuthCard content={loginSignupContent} />
        </div>
      </div>
    </PageShell>
  );
}
