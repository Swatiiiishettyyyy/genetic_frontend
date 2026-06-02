import { BrandLogo } from "../../../components/BrandLogo.jsx";

export function AuthDecor() {
  return (
    <section className="relative flex min-h-[clamp(11rem,33vw,28rem)] min-w-0 items-center justify-center overflow-hidden lg:min-h-[min(58dvh,42rem)] lg:overflow-visible">
      <div className="absolute left-1/2 top-1/2 size-[clamp(12rem,23vw,22.4375rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-nucleotide-sea/50 lg:left-[18%]" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(20rem,48vw,51.5625rem)] -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-full border border-dashed border-nucleotide-orange/60 lg:left-[18%]" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(30rem,76vw,85.875rem)] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-full border border-dashed border-nucleotide-purple/60 lg:left-[18%]" />

      <div className="relative z-10 lg:absolute lg:left-[calc(18%-1.75rem)] lg:top-1/2 lg:-translate-y-1/2">
        <BrandLogo variant="dark" className="h-auto w-[clamp(10rem,22vw,25.625rem)]" />
      </div>
    </section>
  );
}
