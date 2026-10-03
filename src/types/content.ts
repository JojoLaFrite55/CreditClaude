export type IconName =
  | "terminal"
  | "server"
  | "network"
  | "shield"
  | "cpu"
  | "monitor"
  | "boxes"
  | "wrench"
  | "languages"
  | "graduation"
  | "briefcase"
  | "mail"
  | "phone"
  | "pin"
  | "car"
  | "user"
  | "route"
  | "folder"
  | "radar"
  | "lock"
  | "layers"
  | "sparkles";

export type NavItem = {
  label: string;
  href: string;
};

export type TerminalLine = {
  command: string;
  output: string;
};

export type Availability = {
  open: boolean;
  label: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  education: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  phoneHref: string;
  license: string;
  cvPath: string;
  availability: Availability;
  terminal: TerminalLine[];
};

export type AboutBlock = {
  title: string;
  body: string;
};

export type Fact = {
  icon: IconName;
  label: string;
  value: string;
};

export type About = {
  blocks: AboutBlock[];
  interests: string[];
  facts: Fact[];
};

export type ContractType = "Alternance" | "Job étudiant" | "CDI" | "CDD" | "Stage";

export type Experience = {
  company: string;
  role: string;
  contract: ContractType;
  start: string;
  end: string;
  context: string;
  missions: string[];
  tags: string[];
};

export type SkillGroup = {
  title: string;
  icon: IconName;
  items: string[];
};

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Language = {
  name: string;
  level: CefrLevel;
};

export type Diploma = {
  title: string;
  speciality: string;
  school: string;
  period: string;
  status: "Obtenu" | "En cours";
};

export type ProjectStatus = "en-cours" | "termines" | "futurs";

export type ProjectPreview =
  | { kind: "topology" }
  | { kind: "code"; language: string; lines: string[] };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  icon: IconName;
  tags: string[];
  preview: ProjectPreview;
  placeholder?: boolean;
};

export type ProjectFilter = {
  value: ProjectStatus | "tous";
  label: string;
};
