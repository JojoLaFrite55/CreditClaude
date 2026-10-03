import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { KineticText } from "@/components/ui/KineticText";
import { Magnetic } from "@/components/ui/Magnetic";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { Tag } from "@/components/ui/Tag";
import { about, profile } from "@/content/profile";
import { diplomas } from "@/content/skills";
import { cn } from "@/lib/cn";

const blockLayout = [
  { col: "col-span-12 lg:col-span-7 lg:col-start-1", speed: 0.06, size: "text-2xl sm:text-3xl lg:text-[2.6rem]" },
  { col: "col-span-12 sm:col-span-10 sm:col-start-3 lg:col-span-6 lg:col-start-6 lg:mt-24", speed: 0.18, size: "text-xl sm:text-2xl lg:text-3xl" },
  { col: "col-span-12 sm:col-span-9 sm:col-start-2 lg:col-span-5 lg:col-start-2 lg:-mt-8", speed: 0.1, size: "text-lg sm:text-xl lg:text-2xl" },
];

export function AboutContent() {
  return (
    <>
      <Container as="section" className="pt-36 sm:pt-44">
        <SectionHeading as="h1" index="(01)" eyebrow="À propos" title="À propos de moi" ghost="Joan" description={profile.tagline} />
      </Container>

      <Container as="section" className="grid grid-cols-12 gap-x-4 gap-y-24 pb-10">
        {about.blocks.map((block, index) => {
          const layout = blockLayout[index % blockLayout.length];
          return (
            <Parallax key={block.title} speed={layout.speed} className={layout.col}>
              <article className="relative">
                <span aria-hidden className="text-outline-accent absolute -top-10 -left-2 font-display text-8xl leading-none font-extrabold opacity-60 sm:-left-10">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Reveal variant="fadeIn" className="relative mb-6 flex items-center gap-3 pl-16 font-mono text-[11px] tracking-[0.3em] text-accent uppercase sm:pl-14">
                  <span className="h-px w-10 bg-accent" />
                  {block.title}
                </Reveal>
                <KineticText
                  text={block.body}
                  stagger={0.012}
                  className={cn("relative font-display leading-[1.12] font-medium tracking-[-0.02em] text-ink/90", layout.size)}
                />
              </article>
            </Parallax>
          );
        })}
      </Container>

      <Container as="section" className="grid grid-cols-12 gap-x-4 gap-y-16 py-24">
        <Parallax speed={0.08} className="col-span-12 sm:col-span-7 lg:col-span-5 lg:col-start-2">
          <h2 className="mb-8 font-mono text-[11px] tracking-[0.3em] text-accent uppercase">/ Mes diplômes</h2>
          <Stagger as="ul" className="border-t border-line">
            {diplomas.map((diploma) => (
              <StaggerItem as="li" key={diploma.title} className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-line py-6">
                <div>
                  <p className="font-display text-4xl leading-none font-extrabold tracking-[-0.04em] uppercase sm:text-5xl">{diploma.title}</p>
                  <p className="mt-2 text-sm text-muted">{diploma.school}</p>
                </div>
                <Tag tone={diploma.status === "Obtenu" ? "accent" : "solid"}>{diploma.status}</Tag>
              </StaggerItem>
            ))}
          </Stagger>
        </Parallax>

        <Parallax speed={0.24} className="col-span-12 sm:col-span-5 lg:col-span-4 lg:col-start-8 lg:mt-40">
          <Stagger as="ul" className="grid grid-cols-2 border-t border-l border-line">
            {about.facts.map((fact) => (
              <StaggerItem as="li" key={fact.label} className="flex min-h-36 flex-col justify-between gap-6 border-r border-b border-line p-4">
                <Icon name={fact.icon} className="size-5 text-accent" />
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">{fact.label}</p>
                  <p className="mt-1 text-sm font-medium">{fact.value}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8">
            <MagneticButton href={profile.cvPath} download variant="secondary">
              Télécharger mon CV <Download className="size-4" />
            </MagneticButton>
          </div>
        </Parallax>

        <div className="col-span-12 lg:col-span-9 lg:col-start-3">
          <h2 className="mb-6 font-mono text-[11px] tracking-[0.3em] text-accent uppercase">/ Centres d&apos;intérêt</h2>
          <Stagger as="ul" className="flex flex-wrap gap-x-6 gap-y-4">
            {about.interests.map((interest, index) => (
              <StaggerItem as="li" key={interest} variant="fadeUp">
                <Magnetic strength={0.3}>
                  <span
                    data-cursor="magnetic"
                    className={cn(
                      "glitch-host inline-block font-display text-4xl font-extrabold tracking-[-0.04em] uppercase sm:text-6xl",
                      index % 2 === 1 ? "text-outline" : "text-ink",
                    )}
                  >
                    <span data-text={interest} className="glitch">
                      {interest}
                    </span>
                  </span>
                </Magnetic>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </>
  );
}
