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

const ELEMENT_ZH: Record<string, string> = {
  "wood-yang": "甲", "wood-yin": "乙",
  "fire-yang": "丙", "fire-yin": "丁",
  "earth-yang": "戊", "earth-yin": "己",
  "metal-yang": "庚", "metal-yin": "辛",
  "water-yang": "壬", "water-yin": "癸",
};

function getLabel(score: number): string {
  if (score >= 85) return "Cosmic Soulmates";
  if (score >= 70) return "Natural Harmony";
  if (score >= 55) return "Dynamic Tension";
  if (score >= 40) return "Growth Challenge";
  return "Opposite Forces";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "compatibility") {
      return renderCompatibilityOG(searchParams);
    }
    return renderReadingOG(searchParams);
  } catch (e: any) {
    return new Response(`OG Error: ${e.message}`, { status: 500 });
  }
}

function renderCompatibilityOG(searchParams: URLSearchParams) {
  const nameA = searchParams.get("nameA") || "Person A";
  const nameB = searchParams.get("nameB") || "Person B";
  const score = parseInt(searchParams.get("score") || "75", 10);
  const elA = searchParams.get("elA") || "fire";
  const elB = searchParams.get("elB") || "water";

  const colorA = ELEMENT_COLORS[elA] || "#F2CA50";
  const colorB = ELEMENT_COLORS[elB] || "#3B82F6";
  const label = getLabel(score);
  const scoreColor = score >= 70 ? "#59DE9B" : score >= 50 ? "#F2CA50" : "#EF4444";
  const elALabel = elA.charAt(0).toUpperCase() + elA.slice(1);
  const elBLabel = elB.charAt(0).toUpperCase() + elB.slice(1);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0A0E1A", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 20, color: "#F9A8D4", marginBottom: 30 }}>Saju Compatibility</div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 50 }}>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#F5F5F5" }}>{nameA}</div>
            <div style={{ display: "flex", fontSize: 18, color: colorA, marginTop: 4 }}>{elALabel}</div>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#EC4899", marginRight: 50 }}>x</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#F5F5F5" }}>{nameB}</div>
            <div style={{ display: "flex", fontSize: 18, color: colorB, marginTop: 4 }}>{elBLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 80, fontWeight: 800, color: scoreColor, marginBottom: 8 }}>{score}%</div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: scoreColor, marginBottom: 40 }}>{label}</div>
        <div style={{ display: "flex", padding: "12px 32px", borderRadius: 50, backgroundColor: "#EC4899", color: "white", fontSize: 20, fontWeight: 700 }}>Check yours free at sajuastrology.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function renderReadingOG(searchParams: URLSearchParams) {
  const name = searchParams.get("name") || "Seeker";
  const archetype = searchParams.get("archetype") || "The Visionary";
  const element = searchParams.get("element") || "fire";
  const yinyang = searchParams.get("yinyang") || "yang";
  const harmony = searchParams.get("harmony") || "75";

  const color = ELEMENT_COLORS[element] || "#F2CA50";
  const zhChar = ELEMENT_ZH[`${element}-${yinyang}`] || "丙";
  const dmLabel = `${yinyang === "yang" ? "Yang" : "Yin"} ${element.charAt(0).toUpperCase() + element.slice(1)}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0A0E1A", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 120, color: color, marginBottom: 8 }}>{zhChar}</div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#F5F5F5", marginBottom: 8 }}>{name} - Cosmic Blueprint</div>
        <div style={{ display: "flex", fontSize: 28, color: color, fontWeight: 600, marginBottom: 30 }}>{archetype} - {dmLabel} - Harmony {harmony}%</div>
        <div style={{ display: "flex", padding: "12px 32px", borderRadius: 50, backgroundColor: "#F2CA50", color: "#0A0E1A", fontSize: 22, fontWeight: 700 }}>Discover yours free at sajuastrology.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
