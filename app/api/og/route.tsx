import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B",
  fire: "#EF4444",
  earth: "#F2CA50",
  metal: "#C0C0C0",
  water: "#3B82F6",
};

const DAY_MASTER_ZH: Record<string, string> = {
  "wood-yang": "甲", "wood-yin": "乙",
  "fire-yang": "丙", "fire-yin": "丁",
  "earth-yang": "戊", "earth-yin": "己",
  "metal-yang": "庚", "metal-yin": "辛",
  "water-yang": "壬", "water-yin": "癸",
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Seeker";
  const archetype = url.searchParams.get("archetype") || "The Visionary";
  const element = url.searchParams.get("element") || "fire";
  const yinyang = url.searchParams.get("yinyang") || "yang";
  const harmony = url.searchParams.get("harmony") || "75";

  const dmKey = `${element}-${yinyang}`;
  const dmZh = DAY_MASTER_ZH[dmKey] || "?";
  const color = ELEMENT_COLORS[element] || "#F2CA50";
  const title = name + " - Cosmic Blueprint";

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0A0E1A 0%, #1A1E2E 50%, #0F131F 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "120px", color: color, marginBottom: "8px", display: "flex" }}>{dmZh}</div>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "#F5F5F5", marginBottom: "8px", display: "flex" }}>{title}</div>
        <div style={{ fontSize: "32px", color: "#F2CA50", marginBottom: "24px", fontWeight: 600, display: "flex" }}>{archetype}</div>
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "14px", color: "#9CA3AF", letterSpacing: "2px", display: "flex" }}>HARMONY</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#F2CA50", display: "flex" }}>{harmony}%</div>
          </div>
          <div style={{ width: "1px", height: "40px", background: "#262A37", display: "flex" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "14px", color: "#9CA3AF", letterSpacing: "2px", display: "flex" }}>PROFILE</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#F5F5F5", display: "flex" }}>1 of 518,400</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "30px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "18px", color: "#9CA3AF", display: "flex" }}>Get your free reading at</div>
          <div style={{ fontSize: "20px", color: "#F2CA50", fontWeight: 700, display: "flex" }}>sajuastrology.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
