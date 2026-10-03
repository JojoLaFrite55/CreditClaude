import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function NotFound() {
  return (
    <Container as="section" className="grid min-h-[90svh] grid-cols-12 content-center gap-x-4 gap-y-8 pt-28">
      <h1 className="glitch-host col-span-12 font-display text-[42vw] leading-[0.75] font-extrabold tracking-[-0.08em] text-outline-accent sm:text-[32vw]">
        <GlitchText text="404" />
      </h1>
      <div className="col-span-12 space-y-6 sm:col-span-6 sm:col-start-7">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">$ ping {"<page>"} — Request timed out.</p>
        <p className="max-w-md text-muted">Ce paquet s&apos;est perdu sur le réseau. La page demandée n&apos;existe pas ou a été déplacée.</p>
        <MagneticButton href="/">
          <ArrowLeft className="size-4" /> Retour à l&apos;accueil
        </MagneticButton>
      </div>
    </Container>
  );
}
