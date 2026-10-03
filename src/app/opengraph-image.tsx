import { ImageResponse } from "next/og";
import { palette } from "@/config/ui";
import { profile } from "@/content/profile";

export const alt = `${profile.fullName} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `radial-gradient(circle at 20% 0%, rgba(20,184,166,0.28), transparent 55%), ${palette.obsidian}`,
          color: palette.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: palette.accent, fontSize: 28 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: palette.accent }} />
          joan@infra:~$ whoami
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>{profile.fullName}</div>
          <div style={{ fontSize: 40, color: palette.accentSoft }}>{profile.role}</div>
          <div style={{ fontSize: 28, color: palette.muted }}>{profile.education}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: palette.muted }}>
          <span>{profile.location} · Cybersécurité · Infrastructures</span>
          <span style={{ color: palette.cta }}>Portfolio</span>
        </div>
      </div>
    ),
    size,
  );
}
