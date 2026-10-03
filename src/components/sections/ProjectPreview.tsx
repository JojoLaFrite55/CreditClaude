import type { ProjectPreview as Preview } from "@/types/content";

const nodes = [
  { x: 40, y: 60, label: "WAN" },
  { x: 120, y: 60, label: "FW" },
  { x: 200, y: 30, label: "SRV" },
  { x: 200, y: 90, label: "LAN" },
  { x: 270, y: 60, label: "VM" },
];

const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
];

function Topology() {
  return (
    <svg viewBox="0 0 310 120" className="h-full w-full" aria-hidden>
      {links.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={nodes[from].x}
          y1={nodes[from].y}
          x2={nodes[to].x}
          y2={nodes[to].y}
          stroke="var(--color-accent)"
          strokeOpacity={0.55}
          strokeWidth={1.2}
          strokeDasharray="4 6"
          className="animate-dash"
        />
      ))}
      {nodes.map((node, index) => (
        <g key={node.label}>
          <rect
            x={node.x - 18}
            y={node.y - 11}
            width={36}
            height={22}
            rx={6}
            fill="var(--color-obsidian)"
            stroke={index === 1 ? "var(--color-cta)" : "var(--color-accent)"}
            strokeOpacity={0.8}
          />
          <text
            x={node.x}
            y={node.y + 3.5}
            textAnchor="middle"
            className="fill-ink/80 font-mono"
            fontSize={9}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Code({ language, lines }: { language: string; lines: string[] }) {
  return (
    <div className="h-full overflow-x-auto px-4 py-3 font-mono text-[11px] leading-5">
      <span className="mb-1 block text-[10px] tracking-widest text-muted/70 uppercase">{language}</span>
      {lines.map((line, index) => (
        <div key={`${index}-${line}`} className="flex gap-3 whitespace-pre">
          <span className="w-4 shrink-0 text-right text-muted/40 select-none">{index + 1}</span>
          <span className="text-accent-soft/85">{line}</span>
        </div>
      ))}
    </div>
  );
}

export function ProjectPreview({ preview }: { preview: Preview }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-line bg-obsidian/80">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-40 [mask-image:none]" />
      <div className="relative h-full">
        {preview.kind === "topology" ? <Topology /> : <Code language={preview.language} lines={preview.lines} />}
      </div>
    </div>
  );
}
