export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px]" />
      <div className="absolute top-[45%] -right-40 h-[420px] w-[420px] rounded-full bg-cta/[0.06] blur-[120px]" />
      <div className="absolute bottom-0 -left-40 h-[380px] w-[380px] rounded-full bg-accent/[0.07] blur-[120px]" />
    </div>
  );
}
