import {
  BriefcaseBusiness,
  Boxes,
  Car,
  Cpu,
  FolderGit2,
  GraduationCap,
  Languages,
  Layers,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Network,
  Phone,
  Radar,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  User,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/types/content";

const registry: Record<IconName, LucideIcon> = {
  terminal: Terminal,
  server: Server,
  network: Network,
  shield: ShieldCheck,
  cpu: Cpu,
  monitor: Monitor,
  boxes: Boxes,
  wrench: Wrench,
  languages: Languages,
  graduation: GraduationCap,
  briefcase: BriefcaseBusiness,
  mail: Mail,
  phone: Phone,
  pin: MapPin,
  car: Car,
  user: User,
  route: Route,
  folder: FolderGit2,
  radar: Radar,
  lock: Lock,
  layers: Layers,
  sparkles: Sparkles,
};

type IconProps = LucideProps & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  const Component = registry[name];
  return <Component aria-hidden strokeWidth={1.75} {...props} />;
}
