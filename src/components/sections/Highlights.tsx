import { Container } from "@/components/ui/Container";
import { KineticText } from "@/components/ui/KineticText";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { highlights } from "@/content/home";

export function Highlights() {
  return (
    <Container as="section" className="py-10">
      <Stagger className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {highlights.map((item, index) => (
          <StaggerItem key={item.label} className="border-b border-line py-8 pr-4 even:pl-4 lg:border-b-0 lg:pl-6 lg:first:pl-0 lg:[&:not(:first-child)]:border-l">
            <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-accent uppercase">({String(index + 1).padStart(2, "0")})</p>
            <KineticText
              as="p"
              by="char"
              text={item.value}
              className="font-display text-[clamp(2rem,4cqw,3.5rem)] leading-none font-extrabold tracking-[-0.03em]"
            />
            <p className="mt-3 text-sm text-muted">{item.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
