import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { KineticText } from "@/components/ui/KineticText";
import { navigation, siteConfig } from "@/config/site";
import { profile } from "@/content/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <Container className="grid grid-cols-12 gap-x-4 gap-y-10 pt-14 pb-6">
        <div className="col-span-12 space-y-3 sm:col-span-5 lg:col-span-4">
          <p className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">[ contact ]</p>
          <AnimatedLink href={`mailto:${profile.email}`} className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            {profile.email}
          </AnimatedLink>
          <div>
            <AnimatedLink href={`tel:${profile.phoneHref}`} className="font-mono text-sm text-muted">
              {profile.phone}
            </AnimatedLink>
          </div>
        </div>

        <nav aria-label="Pied de page" className="col-span-6 flex flex-col gap-1 font-mono text-xs tracking-[0.16em] text-muted uppercase sm:col-span-3 sm:col-start-7 lg:col-start-8">
          {navigation.map((item) => (
            <AnimatedLink key={item.href} href={item.href} className="w-fit">
              {item.label}
            </AnimatedLink>
          ))}
        </nav>

        <div className="col-span-6 font-mono text-xs leading-relaxed text-muted sm:col-span-3 lg:col-span-2 lg:col-start-11">
          <p className="max-w-[22ch]">{profile.tagline}</p>
          <p className="mt-3 text-accent">{profile.location}, France</p>
        </div>
      </Container>

      <Container className="relative">
        <KineticText
          as="div"
          by="char"
          text={profile.lastName}
          className="font-display text-[clamp(1.5rem,9.4cqw,10rem)] leading-[0.85] font-extrabold tracking-[-0.04em] whitespace-nowrap text-ink/[0.07] uppercase"
          stagger={0.02}
        />
      </Container>

      <Container className="flex flex-col gap-2 border-t border-line py-5 font-mono text-[10px] tracking-[0.18em] text-muted/70 uppercase sm:flex-row sm:justify-between">
        <p>
          © {year} {siteConfig.name}
        </p>
        <p>Next.js / R3F / GLSL / Lenis</p>
      </Container>
    </footer>
  );
}
