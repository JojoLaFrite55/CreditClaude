import type { Experience } from "@/types/content";

export const experiences: Experience[] = [
  {
    company: "ISA-Consulting",
    role: "Technicien Support et Déploiement Informatique",
    contract: "Alternance",
    start: "Août 2025",
    end: "Août 2026",
    context: "Entreprise à taille humaine, support et infrastructure pour une clientèle professionnelle.",
    missions: [
      "Support utilisateurs niveaux 1 et 2 (N1/N2) et résolution d'incidents au quotidien",
      "Administration d'environnements Windows Server et de la téléphonie IP",
      "Diagnostics réseau sur site, intervention sur baies de brassage",
      "Maintenance matérielle et déploiement d'infrastructures physiques",
      "Montée en compétences sur un laboratoire technique distant accessible via VPN",
    ],
    tags: ["Windows Server", "ToIP", "Réseau", "VPN", "Support N1/N2"],
  },
  {
    company: "OCP Répartition",
    role: "Préparateur de Commandes Pharmaceutiques",
    contract: "Job étudiant",
    start: "Avril 2025",
    end: "Juin 2025",
    context: "Entrepôt de répartition pharmaceutique à forte cadence, en parallèle de ma scolarité.",
    missions: [
      "Préparation de commandes pharmaceutiques avec un haut niveau de rigueur",
      "Travail en horaires décalés sur un rythme très exigeant",
      "Gestion de la pression et respect strict des délais",
    ],
    tags: ["Rigueur", "Cadence", "Gestion du stress"],
  },
  {
    company: "ESII",
    role: "Contrôleur d'entrée — Logistique / Production",
    contract: "Alternance",
    start: "Septembre 2023",
    end: "Janvier 2025",
    context: "Entreprise spécialisée dans les solutions de gestion d'accueil, sur tout le cycle de vie du matériel.",
    missions: [
      "Logistique physique et contrôle du matériel entrant",
      "Assemblage de matériel en série",
      "Administration des ventes : devis, factures et bons de livraison sur l'ERP",
      "Suivi complet des commandes et gestion quotidienne des appels clients",
    ],
    tags: ["ERP", "ADV", "Assemblage", "Relation client"],
  },
];
