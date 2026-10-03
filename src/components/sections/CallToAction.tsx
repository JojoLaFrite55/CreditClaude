import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Container } from "@/components/ui/Container";
import { KineticText } from "@/components/ui/KineticText";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";

type CallToActionProps = {
  title: string;
  description: string;
};

export function CallToAction({ title, description }: CallToActionProps) {
  return (
    <Container as="section" className="relative grid grid-cols-12 gap-x-4 py-24 sm:py-36">
      <Parallax speed={0.12} className="col-span-12 lg:col-span-7">
        <KineticText as="h2" text={title} className="font-display text-[clamp(1.75rem,3.6cqw,3.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance" />
      </Parallax>
      <div className="col-span-12 mt-10 flex flex-col justify-end gap-8 sm:col-span-8 sm:col-start-5 lg:col-span-4 lg:col-start-9 lg:mt-24">
        <Reveal>
          <p className="text-pretty text-muted">{description}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <TransitionLink
            href="/contact"
            className="group relative flex aspect-square w-32 items-center justify-center rounded-full bg-accent text-void sm:w-36"
          >
            <span className="absolute inset-0 rounded-full border border-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
            <span className="flex flex-col items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase">
              <ArrowUpRight className="size-6 transition-transform duration-500 group-hover:rotate-45" />
              Me contacter
            </span>
          </TransitionLink>
        </Reveal>
      </div>
    </Container>
  );
}
