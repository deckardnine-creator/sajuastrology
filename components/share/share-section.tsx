"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Download, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ELEMENTS, type Element, type SajuChart } from "@/lib/saju-calculator";
import { ARCHETYPE_CONTENT } from "@/lib/archetype-content";
import { toast } from "sonner";

// Social icons
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ShareSectionProps {
  chart: SajuChart;
}

export function ShareSection({ chart }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const archetypeContent = ARCHETYPE_CONTENT[chart.archetype as keyof typeof ARCHETYPE_CONTENT];
  const dayMasterElement = chart.dayMaster.element as Element;
  const dayMasterColor = ELEMENTS[dayMasterElement]?.color || "#F2CA50";

  const generateShareImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0A0E1A");
    gradient.addColorStop(0.5, "#0F1629");
    gradient.addColorStop(1, "#0A0E1A");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Particles
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 0.5;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 202, 80, ${Math.random() * 0.3 + 0.1})`;
      ctx.fill();
    }

    // Logo
    ctx.font = "16px serif";
    ctx.fillStyle = "#F2CA50";
    ctx.textAlign = "center";
    ctx.fillText("SajuAstrology.com", width / 2, 50);

    // Day Master glow
    const glowY = height * 0.32;
    const glowGradient = ctx.createRadialGradient(width / 2, glowY, 0, width / 2, glowY, 120);
    glowGradient.addColorStop(0, dayMasterColor + "50");
    glowGradient.addColorStop(1, "transparent");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // Chinese character
    ctx.font = "bold 100px serif";
    ctx.fillStyle = dayMasterColor;
    ctx.fillText(chart.dayMaster.zh, width / 2, glowY + 35);

    // Label
    ctx.font = "18px sans-serif";
    ctx.fillText(chart.dayMaster.en, width / 2, glowY + 70);

    // Archetype
    ctx.font = "bold 48px serif";
    ctx.fillStyle = "#F2CA50";
    ctx.fillText(chart.archetype, width / 2, height * 0.52);

    // Score
    const scoreY = height * 0.62;
    ctx.beginPath();
    ctx.arc(width / 2, scoreY, 35, 0, Math.PI * 2);
    ctx.strokeStyle = "#F2CA50";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#F2CA50";
    ctx.fillText(`${chart.harmonyScore}%`, width / 2, scoreY + 8);

    // Traits
    const traits = archetypeContent?.strengths.slice(0, 3) || ["Bold", "Intuitive", "Creative"];
    const pillY = height * 0.72;
    const traitText = traits.join(" \u00B7 ");
    ctx.font = "16px sans-serif";
    const pillWidth = ctx.measureText(traitText).width + 40;

    ctx.fillStyle = "rgba(242, 202, 80, 0.15)";
    ctx.beginPath();
    ctx.roundRect((width - pillWidth) / 2, pillY - 15, pillWidth, 36, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(242, 202, 80, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect((width - pillWidth) / 2, pillY - 15, pillWidth, 36, 18);
    ctx.stroke();

    ctx.fillStyle = "#F2CA50";
    ctx.fillText(traitText, width / 2, pillY + 7);

    // CTA
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("What's YOUR cosmic archetype?", width / 2, height * 0.84);

    // URL
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("sajuastrology.com", width / 2, height - 30);

    return canvas.toDataURL("image/png");
  }, [chart, dayMasterColor, archetypeContent]);

  useEffect(() => {
    generateShareImage();
  }, [generateShareImage]);

  const handleDownload = async () => {
    setIsGenerating(true);
    const dataUrl = await generateShareImage();
    setIsGenerating(false);
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = "my-saju-archetype.png";
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/calculate?ref=share`);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`I'm ${chart.archetype} according to my Saju birth chart! What's your cosmic archetype?`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent("https://sajuastrology.com/calculate")}`, "_blank");
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://sajuastrology.com/calculate")}`, "_blank");
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I'm ${chart.archetype} on SajuAstrology! What's your cosmic archetype? https://sajuastrology.com/calculate`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8 text-center">
      <h2 className="text-xl font-serif text-primary mb-2">Share Your Cosmic Identity</h2>
      <p className="text-muted-foreground mb-6">Let your friends discover their archetype too.</p>

      {/* Preview Card */}
      <div className="flex justify-center mb-6">
        <div className="bg-background rounded-xl overflow-hidden w-[240px] h-[320px]">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm" disabled={isGenerating}>
          {isGenerating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
          Download
        </Button>
        <Button onClick={handleCopyLink} variant="outline" size="sm">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Link2 className="w-4 h-4 mr-1" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button onClick={handleTwitterShare} variant="outline" size="sm">
          <TwitterIcon />
          <span className="ml-1">Twitter</span>
        </Button>
        <Button onClick={handleFacebookShare} variant="outline" size="sm">
          <FacebookIcon />
          <span className="ml-1">Facebook</span>
        </Button>
        <Button onClick={handleWhatsAppShare} variant="outline" size="sm">
          <WhatsAppIcon />
          <span className="ml-1">WhatsApp</span>
        </Button>
      </div>
    </div>
  );
}
