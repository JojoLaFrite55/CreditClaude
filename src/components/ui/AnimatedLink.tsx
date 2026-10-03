import { TransitionLink } from "@/components/transition/TransitionLink";
import { cn } from "@/lib/cn";

type AnimatedLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
};

export function AnimatedLink({ href, children, className, active = false }: AnimatedLinkProps) {
  const classes = cn("group relative inline-flex items-center gap-1.5 py-1 transition-colors hover:text-ink", className);
  const underline = (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-gradient-to-r from-accent to-accent-soft transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100",
        active && "scale-x-100",
      )}
    />
  );

  if (href.startsWith("/")) {
    return (
      <TransitionLink href={href} className={classes}>
        {children}
        {underline}
      </TransitionLink>
    );
  }

  const external = href.startsWith("http");

  return (
    <a
      href={href}
      className={classes}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
      {underline}
    </a>
  );
}
