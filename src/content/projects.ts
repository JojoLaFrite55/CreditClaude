import type { Project, ProjectFilter } from "@/types/content";

export const projectFilters: ProjectFilter[] = [
  { value: "tous", label: "Tous" },
  { value: "en-cours", label: "En cours" },
  { value: "termines", label: "Terminés" },
  { value: "futurs", label: "Futurs" },
];

export const statusLabels: Record<Project["status"], string> = {
  "en-cours": "En cours",
  termines: "Terminé",
  futurs: "À venir",
};

export const projects: Project[] = [
  {
    slug: "homelab-proxmox",
    title: "Homelab Proxmox",
    summary:
      "Cluster de virtualisation personnel : VMs Debian et Windows Server, segmentation en VLAN et pare-feu pfSense en frontal.",
    status: "en-cours",
    icon: "server",
    tags: ["Proxmox", "pfSense", "VLAN", "Debian"],
    preview: { kind: "topology" },
    placeholder: true,
  },
  {
    slug: "automatisation-ad",
    title: "Automatisation Active Directory",
    summary:
      "Scripts PowerShell pour créer des comptes en masse depuis un CSV, ranger les objets en OU et appliquer les GPO.",
    status: "en-cours",
    icon: "terminal",
    tags: ["PowerShell", "Active Directory", "GPO"],
    preview: {
      kind: "code",
      language: "powershell",
      lines: [
        "Import-Csv .\\users.csv | ForEach-Object {",
        "  New-ADUser -Name $_.Nom `",
        "    -Path \"OU=Staff,DC=lab,DC=local\" `",
        "    -Enabled $true",
        "}",
      ],
    },
    placeholder: true,
  },
  {
    slug: "maquette-multi-sites",
    title: "Maquette réseau multi-sites",
    summary:
      "Simulation Cisco Packet Tracer : VLAN, routage inter-VLAN, DHCP relais et ACL entre deux sites distants.",
    status: "termines",
    icon: "network",
    tags: ["Cisco", "Packet Tracer", "ACL", "DHCP"],
    preview: { kind: "topology" },
    placeholder: true,
  },
  {
    slug: "infra-windows-server",
    title: "Infrastructure Windows Server",
    summary:
      "Déploiement d'un domaine complet : AD DS, DNS, DHCP, partages de fichiers et stratégies de groupe.",
    status: "termines",
    icon: "server",
    tags: ["Windows Server", "AD DS", "DNS", "DHCP"],
    preview: {
      kind: "code",
      language: "powershell",
      lines: [
        "Install-WindowsFeature AD-Domain-Services `",
        "  -IncludeManagementTools",
        "Install-ADDSForest -DomainName \"lab.local\"",
        "Add-DhcpServerv4Scope -Name \"LAN\" `",
        "  -StartRange 10.0.10.50 -EndRange 10.0.10.200",
      ],
    },
    placeholder: true,
  },
  {
    slug: "soc-wazuh",
    title: "SOC maison avec Wazuh",
    summary:
      "Mise en place d'un SIEM open source : collecte de logs, détection d'intrusion et tableaux de bord d'alertes.",
    status: "futurs",
    icon: "radar",
    tags: ["Wazuh", "SIEM", "Détection", "Logs"],
    preview: { kind: "topology" },
    placeholder: true,
  },
  {
    slug: "durcissement-ansible",
    title: "Durcissement Linux avec Ansible",
    summary:
      "Playbooks Ansible appliquant les recommandations de sécurité de l'ANSSI sur un parc de serveurs Debian.",
    status: "futurs",
    icon: "lock",
    tags: ["Ansible", "Linux", "ANSSI", "Hardening"],
    preview: {
      kind: "code",
      language: "yaml",
      lines: [
        "- hosts: serveurs",
        "  become: true",
        "  tasks:",
        "    - name: Interdire root en SSH",
        "      lineinfile:",
        "        path: /etc/ssh/sshd_config",
        "        line: PermitRootLogin no",
      ],
    },
    placeholder: true,
  },
];
