import type { Metadata } from "next";
import { Download } from "lucide-react";
import { EducationList } from "@/components/sections/EducationList";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { SkillsGrid } from "@/components/sections/SkillsGrid";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiences } from "@/content/experience";
import { profile } from "@/content/profile";
import { diplomas, languages, skillGroups } from "@/content/skills";

export const metadata: Metadata = {
  title: "Parcours & Compétences",
  description: "Expériences professionnelles, diplômes et compétences techniques de Joan Trichard Clermont : Windows Server, Linux, Proxmox, réseau.",
  alternates: { canonical: "/parcours" },
};

export default function ParcoursPage() {
  return (
    <>
      <Container as="section" className="pt-36 pb-16">
        <SectionHeading
          as="h1"
          eyebrow="CV & Expériences"
          title="Parcours professionnel"
          description="Trois expériences en entreprise, dont deux en alternance, du support utilisateur au déploiement d'infrastructures."
        />
        <Reveal className="mb-12">
          <MagneticButton href={profile.cvPath} download variant="secondary">
            Télécharger le CV complet <Download className="size-4" />
          </MagneticButton>
        </Reveal>
        <ExperienceTimeline items={experiences} />
      </Container>

      <Container as="section" className="py-16">
        <SectionHeading
          eyebrow="Stack technique"
          title="Compétences"
          description="Systèmes, virtualisation, réseau et outils que j'utilise au quotidien en entreprise et dans mon homelab."
        />
        <SkillsGrid groups={skillGroups} languages={languages} />
      </Container>

      <Container as="section" className="py-16">
        <SectionHeading eyebrow="Formation" title="Diplômes" />
        <EducationList items={diplomas} />
      </Container>
    </>
  );
}
