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

const ELEMENT_LABEL: Record<string, string> = {
  wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
};

function getLabel(score: number): string {
  if (score >= 85) return "Cosmic Soulmates";
  if (score >= 70) return "Natural Harmony";
  if (score >= 55) return "Dynamic Tension";
  if (score >= 40) return "Growth Challenge";
  return "Opposite Forces";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "compatibility") {
    return renderCompatibilityOG(searchParams);
  }
  return renderReadingOG(searchParams);
}

/* ─── Compatibility OG Image ─── */

function renderCompatibilityOG(searchParams: URLSearchParams) {
  const nameA = searchParams.get("nameA") || "Person A";
  const nameB = searchParams.get("nameB") || "Person B";
  const score = parseInt(searchParams.get("score") || "75", 10);
  const elA = searchParams.get("elA") || "fire";
  const elB = searchParams.get("elB") || "water";

  const colorA = ELEMENT_COLORS[elA] || "#F2CA50";
  const colorB = ELEMENT_COLORS[elB] || "#3B82F6";
  const labelA = ELEMENT_LABEL[elA] || "✦";
  const labelB = ELEMENT_LABEL[elB] || "✦";
  const label = getLabel(score);
  const scoreColor = score >= 70 ? "#59DE9B" : score >= 50 ? "#F2CA50" : "#EF4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0E1A 0%, #1a0a20 50%, #0A0E1A 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: 100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colorA}25 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: 100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colorB}25 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: 400,
            width: 400,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 24px",
            borderRadius: 50,
            background: "rgba(236,72,153,0.15)",
            border: "1px solid rgba(236,72,153,0.3)",
            color: "#F9A8D4",
            fontSize: 18,
            marginBottom: 32,
          }}
        >
          ♡ Saju Compatibility
        </div>

        {/* Two people */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 60,
            marginBottom: 24,
          }}
        >
          {/* Person A */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${colorA}20`,
                border: `3px solid ${colorA}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 8,
              }}
            >
              {labelA}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#F5F5F5" }}>{nameA}</div>
            <div style={{ fontSize: 16, color: colorA }}>{elA.charAt(0).toUpperCase() + elA.slice(1)}</div>
          </div>

          {/* Heart */}
          <div style={{ fontSize: 48, color: "#EC4899" }}>♥</div>

          {/* Person B */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${colorB}20`,
                border: `3px solid ${colorB}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 8,
              }}
            >
              {labelB}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#F5F5F5" }}>{nameB}</div>
            <div style={{ fontSize: 16, color: colorB }}>{elB.charAt(0).toUpperCase() + elB.slice(1)}</div>
          </div>
        </div>

        {/* Score */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: scoreColor,
            lineHeight: 1,
            marginBottom: 4,
            textShadow: `0 0 40px ${scoreColor}60`,
          }}
        >
          {score}%
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: scoreColor,
            marginBottom: 28,
          }}
        >
          {label}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 28px",
            borderRadius: 50,
            background: "linear-gradient(135deg, #EC4899, #A855F7)",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Check yours free → sajuastrology.com
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            fontSize: 14,
            color: "rgba(245,245,245,0.35)",
          }}
        >
          SajuAstrology — Four Pillars Compatibility
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

/* ─── Reading OG Image (existing) ─── */

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
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0E1A 0%, #131832 50%, #0A0E1A 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Day Master character */}
        <div
          style={{
            fontSize: 120,
            color: color,
            marginBottom: 8,
            textShadow: `0 0 60px ${color}80`,
          }}
        >
          {zhChar}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#F5F5F5",
            marginBottom: 8,
          }}
        >
          {name}{"'"}s Cosmic Blueprint
        </div>

        {/* Archetype + Element */}
        <div
          style={{
            fontSize: 28,
            color: color,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          {archetype} · {dmLabel} · Harmony {harmony}%
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 32px",
            borderRadius: 50,
            background: "linear-gradient(135deg, #F2CA50, #D4A84B)",
            color: "#0A0E1A",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Discover yours free → sajuastrology.com
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 16,
            color: "rgba(245,245,245,0.4)",
          }}
        >
          SajuAstrology — 518,400 unique cosmic profiles
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
