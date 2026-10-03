import type { Metadata } from "next";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projectFilters, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projets",
  description: "Projets système, réseau et cybersécurité de Joan Trichard Clermont : homelab Proxmox, Active Directory, Cisco, SIEM.",
  alternates: { canonical: "/projets" },
};

export default function ProjetsPage() {
  return (
    <>
      <Container as="section" className="pt-36 pb-16 sm:pt-44">
        <SectionHeading
          as="h1"
          index="(05)"
          ghost="Labs"
          eyebrow="Labs & réalisations"
          title="Projets"
          description="Infrastructures, scripts et maquettes réseau : ce que je construis, ce que j'ai terminé et ce qui arrive."
        />
        <ProjectsExplorer projects={projects} filters={projectFilters} />
      </Container>
      <CallToAction
        title="Un projet d'infrastructure en tête ?"
        description="Je suis toujours partant pour échanger sur un lab, une architecture réseau ou une problématique de sécurité."
      />
    </>
  );
}
