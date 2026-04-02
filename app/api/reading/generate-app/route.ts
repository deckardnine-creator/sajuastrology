import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju-calculator";
import { calculateAdvancedSaju } from "@/lib/saju-advanced";

export const maxDuration = 120;

// Simplified endpoint for mobile app — accepts raw birth data, does calculation server-side
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gender, birthYear, birthMonth, birthDay, birthHour, birthMinute, birthCity, lat, lng, locale } = body;

    if (!name || !gender || !birthYear || !birthMonth || !birthDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build date object
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const hour = birthHour ?? 12;
    const minute = birthMinute ?? 0;
    const city = birthCity || "Seoul";

    // Calculate saju chart — signature must match compatibility route:
    // calculateSaju(name, gender, date, hour, city)
    const basicChart = calculateSaju(
      name, gender, birthDate, hour, city
    );

    const advancedChart = calculateAdvancedSaju(basicChart);

    // Merge into full chart object
    const chart = {
      ...basicChart,
      ...advancedChart,
      name,
      gender,
      birthCity: city,
      birthDate: `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
      birthHour: hour,
      birthMinute: minute,
    };

    // Call the existing generate reading API internally
    const generateUrl = new URL("/api/reading/generate", req.url);
    const generateRes = await fetch(generateUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chart,
        userId: null,
        locale: locale || "en",
        birthDateStr: `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      let errMsg = "Generation failed";
      try {
        const errData = JSON.parse(errText);
        errMsg = errData.error || errMsg;
      } catch {}
      console.error("generate-app: internal generate failed:", generateRes.status, errText.substring(0, 300));
      return NextResponse.json(
        { error: errMsg },
        { status: generateRes.status }
      );
    }

    const data = await generateRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("generate-app error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
