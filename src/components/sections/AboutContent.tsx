import { Download, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { Tag } from "@/components/ui/Tag";
import { about, profile } from "@/content/profile";
import { diplomas } from "@/content/skills";

export function AboutContent() {
  return (
    <Container as="section" className="pt-36 pb-12">
      <SectionHeading as="h1" eyebrow="À propos" title="À propos de moi" description={profile.tagline} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          {about.blocks.map((block, index) => (
            <Reveal key={block.title} delay={index * 0.05} className="relative pl-8">
              <span aria-hidden className="absolute top-1 left-0 font-mono text-xs text-accent">
                0{index + 1}
              </span>
              <h2 className="mb-4 font-display text-2xl font-semibold text-accent-soft">{block.title}</h2>
              <p className="text-lg leading-relaxed text-pretty text-ink/85">{block.body}</p>
            </Reveal>
          ))}

          <Reveal className="pl-8">
            <h2 className="mb-4 font-display text-lg font-semibold">Centres d&apos;intérêt</h2>
            <Stagger as="ul" className="flex flex-wrap gap-2">
              {about.interests.map((interest) => (
                <StaggerItem as="li" variant="scaleIn" key={interest}>
                  <Tag tone="accent">{interest}</Tag>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal variant="scaleIn" className="glass rounded-2xl p-7">
            <h2 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold text-accent-soft">
              <GraduationCap className="size-5" /> Mes diplômes
            </h2>
            <ul className="space-y-5">
              {diplomas.map((diploma) => (
                <li key={diploma.title} className="border-l-2 border-accent/40 pl-4">
                  <p className="font-semibold">{diploma.title}</p>
                  <p className="text-sm text-muted">{diploma.school}</p>
                  <Tag tone={diploma.status === "Obtenu" ? "accent" : "cta"} className="mt-2">
                    {diploma.status}
                  </Tag>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="scaleIn" delay={0.1} className="glass rounded-2xl p-7">
            <Stagger as="ul" className="grid grid-cols-2 gap-5">
              {about.facts.map((fact) => (
                <StaggerItem as="li" key={fact.label} className="flex flex-col gap-1.5">
                  <Icon name={fact.icon} className="size-5 text-accent" />
                  <span className="text-xs tracking-wide text-muted uppercase">{fact.label}</span>
                  <span className="text-sm font-medium">{fact.value}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          <MagneticButton href={profile.cvPath} download variant="secondary" className="w-full">
            Télécharger mon CV <Download className="size-4" />
          </MagneticButton>
        </aside>
      </div>
    </Container>
  );
}
