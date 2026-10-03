import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";

type CallToActionProps = {
  title: string;
  description: string;
};

export function CallToAction({ title, description }: CallToActionProps) {
  return (
    <Container as="section" className="py-16">
      <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 px-8 py-14 text-center sm:px-16">
        <div aria-hidden className="absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-cta/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="max-w-xl text-pretty text-muted">{description}</p>
          <MagneticButton href="/contact">
            <Mail className="size-4" /> Me contacter
          </MagneticButton>
        </div>
      </Reveal>
    </Container>
  );
}
