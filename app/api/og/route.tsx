import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B", fire: "#EF4444", earth: "#F2CA50", metal: "#C0C0C0", water: "#3B82F6",
};
const ELEMENT_ZH: Record<string, string> = {
  "wood-yang": "甲", "wood-yin": "乙", "fire-yang": "丙", "fire-yin": "丁",
  "earth-yang": "戊", "earth-yin": "己", "metal-yang": "庚", "metal-yin": "辛",
  "water-yang": "壬", "water-yin": "癸",
};
const EL: Record<string, string> = { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" };

function getLabel(s: number) { return s >= 85 ? "Cosmic Soulmates" : s >= 70 ? "Natural Harmony" : s >= 55 ? "Dynamic Tension" : s >= 40 ? "Growth Challenge" : "Opposite Forces"; }
function getSC(s: number) { return s >= 70 ? "#59DE9B" : s >= 50 ? "#F2CA50" : "#EF4444"; }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("type") === "compatibility") return renderCompat(searchParams);
    return renderReading(searchParams);
  } catch (e: any) { return new Response(`OG Error: ${e.message}`, { status: 500 }); }
}

function renderCompat(sp: URLSearchParams) {
  const nA = sp.get("nameA") || "Person A", nB = sp.get("nameB") || "Person B";
  const sc = parseInt(sp.get("score") || "75", 10);
  const eA = sp.get("elA") || "fire", eB = sp.get("elB") || "water";
  const cA = ELEMENT_COLORS[eA] || "#F2CA50", cB = ELEMENT_COLORS[eB] || "#3B82F6";
  const lbl = getLabel(sc), sCol = getSC(sc);

  return new ImageResponse((
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #0f0a1e, #1a0e2e, #0a0e1a)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", position: "absolute", top: "0", left: "0", right: "0", height: "3px", background: `linear-gradient(90deg, transparent, ${cA}, #EC4899, ${cB}, transparent)` }} />
      <div style={{ display: "flex", position: "absolute", top: "80px", left: "200px", width: "250px", height: "250px", borderRadius: "50%", backgroundColor: `${cA}15` }} />
      <div style={{ display: "flex", position: "absolute", bottom: "60px", right: "220px", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: `${cB}12` }} />
      <div style={{ display: "flex", fontSize: 16, color: "#EC4899", letterSpacing: "3px", marginBottom: "32px" }}>SAJU COMPATIBILITY</div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "36px" }}>
          <div style={{ display: "flex", width: "72px", height: "72px", borderRadius: "50%", alignItems: "center", justifyContent: "center", backgroundColor: `${cA}20`, border: `2px solid ${cA}50`, marginBottom: "10px" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: cA }}>{(EL[eA] || "F").charAt(0)}</div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#F5F5F5" }}>{nA}</div>
          <div style={{ display: "flex", fontSize: 13, color: `${cA}CC`, marginTop: "3px" }}>{EL[eA] || "Fire"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "36px" }}>
          <div style={{ display: "flex", width: "50px", height: "1px", background: `linear-gradient(90deg, ${cA}60, #EC489980, ${cB}60)`, marginBottom: "8px" }} />
          <div style={{ display: "flex", fontSize: 22, color: "#EC4899" }}>&#9829;</div>
          <div style={{ display: "flex", width: "50px", height: "1px", background: `linear-gradient(90deg, ${cA}60, #EC489980, ${cB}60)`, marginTop: "8px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", width: "72px", height: "72px", borderRadius: "50%", alignItems: "center", justifyContent: "center", backgroundColor: `${cB}20`, border: `2px solid ${cB}50`, marginBottom: "10px" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: cB }}>{(EL[eB] || "W").charAt(0)}</div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#F5F5F5" }}>{nB}</div>
          <div style={{ display: "flex", fontSize: 13, color: `${cB}CC`, marginTop: "3px" }}>{EL[eB] || "Water"}</div>
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: sCol, lineHeight: "1", marginBottom: "4px" }}>{sc}%</div>
      <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: sCol, marginBottom: "32px" }}>{lbl}</div>
      <div style={{ display: "flex", padding: "10px 28px", borderRadius: "50px", background: "linear-gradient(135deg, #EC4899, #A855F7)", color: "white", fontSize: 16, fontWeight: 700 }}>Check yours free at sajuastrology.com</div>
      <div style={{ display: "flex", position: "absolute", bottom: "0", left: "0", right: "0", height: "2px", background: `linear-gradient(90deg, transparent, ${cA}50, #EC489960, ${cB}50, transparent)` }} />
    </div>
  ), { width: 1200, height: 630 });
}

function renderReading(sp: URLSearchParams) {
  const name = sp.get("name") || "Seeker";
  const arch = sp.get("archetype") || "The Visionary";
  const el = sp.get("element") || "fire";
  const yy = sp.get("yinyang") || "yang";
  const harm = sp.get("harmony") || "75";
  const col = ELEMENT_COLORS[el] || "#F2CA50";
  const zh = ELEMENT_ZH[`${el}-${yy}`] || "丙";
  const dm = `${yy === "yang" ? "Yang" : "Yin"} ${EL[el] || "Fire"}`;

  return new ImageResponse((
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #0f0a1e, #1a0e2e, #0a0e1a)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", position: "absolute", top: "0", left: "0", right: "0", height: "2px", background: `linear-gradient(90deg, transparent, ${col}40, #F2CA5040, transparent)` }} />
      <div style={{ display: "flex", position: "absolute", top: "120px", left: "400px", width: "400px", height: "400px", borderRadius: "50%", backgroundColor: `${col}10` }} />
      <div style={{ display: "flex", fontSize: 15, color: "#F2CA5090", letterSpacing: "4px", marginBottom: "28px" }}>SAJU - FOUR PILLARS OF DESTINY</div>
      <div style={{ display: "flex", fontSize: 110, color: col, lineHeight: "1", marginBottom: "16px" }}>{zh}</div>
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#F5F5F5", marginBottom: "10px" }}>{name}</div>
      <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: col, marginBottom: "8px" }}>{arch}</div>
      <div style={{ display: "flex", fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: "32px" }}>{dm}  --  Harmony {harm}%</div>
      <div style={{ display: "flex", padding: "10px 28px", borderRadius: "50px", background: "linear-gradient(135deg, #F2CA50, #D9AA28)", color: "#0A0E1A", fontSize: 16, fontWeight: 700 }}>Discover yours free at sajuastrology.com</div>
      <div style={{ display: "flex", position: "absolute", bottom: "0", left: "0", right: "0", height: "2px", background: `linear-gradient(90deg, transparent, ${col}40, #F2CA5030, transparent)` }} />
    </div>
  ), { width: 1200, height: 630 });
}
