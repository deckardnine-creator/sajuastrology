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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
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
          {name}&apos;s Cosmic Blueprint
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
