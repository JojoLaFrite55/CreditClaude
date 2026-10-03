import { Container } from "@/components/ui/Container";
import { KineticText } from "@/components/ui/KineticText";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { highlights } from "@/content/home";
import { cn } from "@/lib/cn";

const layout = [
  { col: "col-span-12 sm:col-span-6 lg:col-span-6", speed: 0.05 },
  { col: "col-span-6 sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-8 lg:mt-40", speed: 0.25 },
  { col: "col-span-6 sm:col-span-5 sm:col-start-2 lg:col-span-3 lg:col-start-3 lg:-mt-10", speed: 0.15 },
  { col: "col-span-12 sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-9 lg:mt-24", speed: 0.32 },
];

export function Highlights() {
  return (
    <Container as="section" className="grid grid-cols-12 gap-x-4 gap-y-14 py-10">
      {highlights.map((item, index) => (
        <Parallax key={item.label} speed={layout[index].speed} className={cn(layout[index].col)}>
          <div className="border-t border-line pt-4">
            <Reveal variant="fadeIn" className="mb-3 font-mono text-[10px] tracking-[0.3em] text-accent uppercase">
              ({String(index + 1).padStart(2, "0")})
            </Reveal>
            <KineticText
              as="p"
              by="char"
              text={item.value}
              className={cn(
                "font-display leading-[0.85] font-extrabold tracking-[-0.05em] uppercase",
                index === 0 ? "text-[14cqw] sm:text-[8cqw] lg:text-[6cqw]" : "text-[11cqw] sm:text-[6cqw] lg:text-[4.2cqw]",
                index % 2 === 1 && "text-outline-accent",
              )}
            />
            <p className="mt-3 max-w-[24ch] text-sm text-muted">{item.label}</p>
          </div>
        </Parallax>
      ))}
    </Container>
  );
}
