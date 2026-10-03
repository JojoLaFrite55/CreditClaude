import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function NotFound() {
  return (
    <Container as="section" className="flex min-h-[80dvh] flex-col items-center justify-center gap-6 pt-28 text-center">
      <p className="font-mono text-sm text-accent">$ ping {"<page>"} — Request timed out.</p>
      <h1 className="font-display text-7xl font-semibold tracking-tight sm:text-8xl">
        <span className="text-gradient">404</span>
      </h1>
      <p className="max-w-md text-muted">Ce paquet s&apos;est perdu sur le réseau. La page demandée n&apos;existe pas ou a été déplacée.</p>
      <MagneticButton href="/">
        <ArrowLeft className="size-4" /> Retour à l&apos;accueil
      </MagneticButton>
    </Container>
  );
}
