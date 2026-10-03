import type { NavItem } from "@/types/content";

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteConfig = {
  name: "Joan Trichard Clermont",
  shortName: "JTC",
  title: "Joan Trichard Clermont — Technicien Système & Réseau",
  description:
    "Portfolio de Joan Trichard Clermont, technicien système et réseau à Montpellier, étudiant en BTS SIO option SISR. Passionné par la cybersécurité et l'administration d'infrastructures.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000"),
  locale: "fr_FR",
  keywords: [
    "Joan Trichard Clermont",
    "Technicien système et réseau",
    "BTS SIO SISR",
    "Cybersécurité",
    "Administration réseau",
    "Windows Server",
    "Proxmox",
    "Montpellier",
    "Alternance",
  ],
} as const;

export const navigation: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Parcours", href: "/parcours" },
  { label: "Projets", href: "/projets" },
  { label: "Contact", href: "/contact" },
];
