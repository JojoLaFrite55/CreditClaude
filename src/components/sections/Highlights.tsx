import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { highlights } from "@/content/home";

export function Highlights() {
  return (
    <Container as="section" className="pb-10">
      <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {highlights.map((item) => (
          <StaggerItem key={item.label} className="flex flex-col gap-1 bg-obsidian/95 px-6 py-7">
            <span className="font-display text-3xl font-semibold text-ink">{item.value}</span>
            <span className="text-sm text-muted">{item.label}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
