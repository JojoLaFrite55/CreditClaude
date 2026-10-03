import type { IconName } from "@/types/content";

export type Highlight = {
  value: string;
  label: string;
};

export type ExploreCard = {
  href: string;
  icon: IconName;
  index: string;
  title: string;
  description: string;
};

export const highlights: Highlight[] = [
  { value: "BTS SIO", label: "Option SISR · 2ème année" },
  { value: "3", label: "Expériences en entreprise" },
  { value: "N1 / N2", label: "Support & déploiement" },
  { value: "C1", label: "Niveau d'anglais" },
];

export const exploreCards: ExploreCard[] = [
  {
    href: "/a-propos",
    icon: "user",
    index: "01",
    title: "À propos",
    description: "Mon parcours, ce qui me motive et où je veux aller : cybersécurité et infrastructures.",
  },
  {
    href: "/parcours",
    icon: "route",
    index: "02",
    title: "Parcours & compétences",
    description: "Mes expériences en alternance, mes diplômes et ma stack système, réseau et virtualisation.",
  },
  {
    href: "/projets",
    icon: "folder",
    index: "03",
    title: "Projets",
    description: "Homelab, scripts d'automatisation et maquettes réseau : en cours, terminés et à venir.",
  },
];
