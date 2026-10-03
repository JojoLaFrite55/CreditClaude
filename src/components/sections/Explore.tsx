import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { TiltCard } from "@/components/ui/TiltCard";
import { exploreCards } from "@/content/home";

export function Explore() {
  return (
    <Container as="section" className="py-20">
      <SectionHeading
        eyebrow="Explorer"
        title="Un portfolio, trois couches."
        description="Comme un modèle OSI : chaque page s'appuie sur la précédente. Commencez où vous voulez."
      />
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {exploreCards.map((card) => (
          <StaggerItem key={card.href} className="h-full">
            <TransitionLink href={card.href} className="block h-full rounded-2xl">
              <TiltCard>
                <div className="flex h-full flex-col gap-6 p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                      <Icon name={card.icon} className="size-6" />
                    </span>
                    <span className="font-mono text-xs text-muted">{card.index}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{card.description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent-soft">
                    Découvrir
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </TiltCard>
            </TransitionLink>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
