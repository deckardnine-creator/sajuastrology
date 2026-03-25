import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ReadingPageClient from "./client";

const DAY_MASTER_DISPLAY: Record<string, string> = {
  "wood-yang": "Yang Wood", "wood-yin": "Yin Wood",
  "fire-yang": "Yang Fire", "fire-yin": "Yin Fire",
  "earth-yang": "Yang Earth", "earth-yin": "Yin Earth",
  "metal-yang": "Yang Metal", "metal-yin": "Yin Metal",
  "water-yang": "Yang Water", "water-yin": "Yin Water",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("readings")
      .select("name, archetype, day_master_element, day_master_yinyang, harmony_score")
      .eq("share_slug", slug)
      .single();

    if (!data) {
      return { title: "Reading Not Found | SajuAstrology" };
    }

    const dmKey = `${data.day_master_element}-${data.day_master_yinyang}`;
    const dmName = DAY_MASTER_DISPLAY[dmKey] || "Unknown";
    const title = `${data.name}'s Cosmic Blueprint — ${data.archetype}`;
    const description = `${data.name} is ${data.archetype} with a ${dmName} Day Master. Harmony Score: ${data.harmony_score}%. Discover your own cosmic blueprint from 518,400 unique profiles.`;

    const ogImageUrl = `https://sajuastrology.com/api/og?name=${encodeURIComponent(data.name)}&archetype=${encodeURIComponent(data.archetype)}&element=${data.day_master_element}&yinyang=${data.day_master_yinyang}&harmony=${data.harmony_score}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://sajuastrology.com/reading/${slug}`,
        siteName: "SajuAstrology",
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return { title: "SajuAstrology — Decode Your Cosmic Blueprint" };
  }
}

export default function ReadingSlugPage() {
  return <ReadingPageClient />;
}
