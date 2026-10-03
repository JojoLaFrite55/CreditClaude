import type { About, Profile } from "@/types/content";

export const profile: Profile = {
  firstName: "Joan",
  lastName: "Trichard Clermont",
  fullName: "Joan Trichard Clermont",
  role: "Technicien Système & Réseau",
  education: "Étudiant en BTS SIO option SISR — 2ème année",
  tagline: "Passionné par la cybersécurité et l'administration d'infrastructures complexes.",
  location: "Montpellier",
  email: "joan.trichard@gmail.com",
  phone: "07 81 39 90 92",
  phoneHref: "+33781399092",
  license: "Permis B — Véhiculé",
  cvPath: "/Joan_Trichard_Clermont_CV.pdf",
  availability: {
    open: true,
    label: "Ouvert aux opportunités d'alternance",
  },
  terminal: [
    { command: "whoami", output: "joan.trichard-clermont" },
    { command: "cat poste.txt", output: "Technicien Système & Réseau · BTS SIO SISR" },
    { command: "systemctl status objectif", output: "● cybersecurite.service — active (running)" },
    { command: "ping -c 1 montpellier", output: "64 bytes from montpellier : disponible, véhiculé" },
  ],
};

export const about: About = {
  blocks: [
    {
      title: "Pourquoi ce domaine\u00A0?",
      body: "J'ai eu la chance d'être initié à l'informatique très jeune par mon père. Ce qui m'intéresse avant tout, c'est la rapidité avec laquelle les technologies évoluent, notamment l'intelligence artificielle en ce moment. Ma curiosité pour la technique dépasse le cadre scolaire : que ce soit dans le gaming, l'audiovisuel, l'automobile ou l'aéronautique, j'aime comprendre comment les systèmes complexes fonctionnent. Ce portfolio a pour but de présenter mes compétences et mes projets actuels.",
    },
    {
      title: "Mes ambitions",
      body: "À l'avenir, je souhaite me spécialiser dans la cybersécurité et l'administration de systèmes et réseaux complexes, en freelance. Mon objectif est de contribuer à la conception et à la maintenance d'infrastructures robustes, sécurisées et performantes.",
    },
    {
      title: "Ce que j'apporte",
      body: "Mes expériences en entreprise m'ont permis de développer mon autonomie, mon sens du service utilisateur et une vraie capacité d'adaptation face aux imprévus techniques. Je cherche un environnement stimulant pour m'investir pleinement et poursuivre mon apprentissage jusqu'au Master (Bac +5).",
    },
  ],
  interests: ["Intelligence artificielle", "Cybersécurité", "Gaming", "Audiovisuel", "Automobile", "Aéronautique"],
  facts: [
    { icon: "pin", label: "Localisation", value: "Montpellier" },
    { icon: "car", label: "Mobilité", value: "Permis B — Véhiculé" },
    { icon: "languages", label: "Anglais", value: "Niveau C1" },
    { icon: "graduation", label: "Objectif", value: "Master — Bac +5" },
  ],
};
