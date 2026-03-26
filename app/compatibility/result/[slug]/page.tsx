import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CompatibilityResultClient from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("compatibility_results")
      .select("person_a_name,person_b_name,overall_score,person_a_element,person_b_element")
      .eq("share_slug", slug)
      .single();

    if (data) {
      const title = `${data.person_a_name} & ${data.person_b_name} — ${data.overall_score}% Compatibility`;
      const description = `Saju compatibility reading: ${data.person_a_name} and ${data.person_b_name} scored ${data.overall_score}% cosmic compatibility. Check yours free!`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [{
            url: `https://sajuastrology.com/api/og?type=compatibility&nameA=${encodeURIComponent(data.person_a_name)}&nameB=${encodeURIComponent(data.person_b_name)}&score=${data.overall_score}&elA=${data.person_a_element}&elB=${data.person_b_element}`,
            width: 1200,
            height: 630,
          }],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch {}

  return {
    title: "Compatibility Reading | SajuAstrology",
    description: "Discover your cosmic compatibility through the Four Pillars of Destiny.",
  };
}

export default function CompatibilityResultPage() {
  return <CompatibilityResultClient />;
}
