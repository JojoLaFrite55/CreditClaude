import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { navigation, siteConfig } from "@/config/site";
import { profile } from "@/content/profile";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line/70">
      <Container className="flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-lg font-semibold">{profile.fullName}</p>
          <p className="text-sm text-muted">{profile.tagline}</p>
          <p className="font-mono text-xs text-muted/70">
            <span className="text-accent">$</span> uptime — {profile.location}, France
          </p>
        </div>

        <nav aria-label="Pied de page" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-muted">
          {navigation.map((item) => (
            <AnimatedLink key={item.href} href={item.href}>
              {item.label}
            </AnimatedLink>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-sm text-muted">
          <AnimatedLink href={`mailto:${profile.email}`}>{profile.email}</AnimatedLink>
          <AnimatedLink href={`tel:${profile.phoneHref}`}>{profile.phone}</AnimatedLink>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line/50 py-6 text-xs text-muted/70 sm:flex-row sm:justify-between">
        <p>
          © {year} {siteConfig.name}. Tous droits réservés.
        </p>
        <p className="font-mono">Next.js · TypeScript · Framer Motion · Vercel</p>
      </Container>
    </footer>
  );
}
