import type { Diploma, Language, SkillGroup } from "@/types/content";

export const skillGroups: SkillGroup[] = [
  {
    title: "Systèmes d'exploitation",
    icon: "monitor",
    items: ["Windows 10 / 11", "Windows Server", "Debian", "Ubuntu", "Linux Mint"],
  },
  {
    title: "Virtualisation",
    icon: "layers",
    items: ["Proxmox VE", "VMware", "VirtualBox", "Hyper-V"],
  },
  {
    title: "Réseau & Sécurité",
    icon: "network",
    items: ["Cisco Packet Tracer", "Wireshark", "VPN", "Téléphonie IP", "Baies de brassage"],
  },
  {
    title: "Outils & Logiciels",
    icon: "wrench",
    items: ["Suite Microsoft 365", "VS Code", "Cursor", "ERP de gestion commerciale"],
  },
];

export const languages: Language[] = [{ name: "Anglais", level: "C1" }];

export const diplomas: Diploma[] = [
  {
    title: "BTS SIO",
    speciality: "Services Informatiques aux Organisations — option SISR",
    school: "My Digital School, Montpellier",
    period: "2025 — 2027",
    status: "En cours",
  },
  {
    title: "Bac Pro SN",
    speciality: "Baccalauréat professionnel Systèmes Numériques",
    school: "CFAI-UIMM, Baillargues",
    period: "2023 — 2025",
    status: "Obtenu",
  },
];
