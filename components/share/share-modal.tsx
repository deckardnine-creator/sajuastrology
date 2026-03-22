"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Link2,
  Check,
  Sparkles,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ELEMENTS, type Element, type SajuChart } from "@/lib/saju-calculator";
import { ARCHETYPE_CONTENT } from "@/lib/archetype-content";
import { toast } from "sonner";

// Social icons as inline SVGs for consistency
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: SajuChart;
}

export function ShareModal({ isOpen, onClose, chart }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const archetypeKey = chart.archetype.toLowerCase().replace(/\s+/g, "-").replace("the-", "");
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

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0A0E1A");
    gradient.addColorStop(0.5, "#0F1629");
    gradient.addColorStop(1, "#0A0E1A");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add decorative gold particles
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 0.5;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 202, 80, ${Math.random() * 0.3 + 0.1})`;
      ctx.fill();
    }

    // Logo at top
    ctx.font = "16px serif";
    ctx.fillStyle = "#F2CA50";
    ctx.textAlign = "center";
    ctx.fillText("SajuAstrology.com", width / 2, 50);

    // Day Master element glow
    const glowY = height * 0.32;
    const glowGradient = ctx.createRadialGradient(
      width / 2, glowY, 0,
      width / 2, glowY, 120
    );
    glowGradient.addColorStop(0, dayMasterColor + "50");
    glowGradient.addColorStop(1, "transparent");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // Day Master Chinese character
    ctx.font = "bold 100px serif";
    ctx.fillStyle = dayMasterColor;
    ctx.textAlign = "center";
    ctx.fillText(chart.dayMaster.zh, width / 2, glowY + 35);

    // Day Master label
    ctx.font = "18px sans-serif";
    ctx.fillStyle = dayMasterColor;
    ctx.fillText(chart.dayMaster.en, width / 2, glowY + 70);

    // Archetype name
    ctx.font = "bold 48px serif";
    ctx.fillStyle = "#F2CA50";
    ctx.fillText(chart.archetype, width / 2, height * 0.52);

    // Harmony Score circle
    const scoreY = height * 0.62;
    ctx.beginPath();
    ctx.arc(width / 2, scoreY, 35, 0, Math.PI * 2);
    ctx.strokeStyle = "#F2CA50";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#F2CA50";
    ctx.fillText(`${chart.harmonyScore}%`, width / 2, scoreY + 8);

    // Personality traits as pills
    const traits = archetypeContent?.strengths.slice(0, 3) || ["Bold", "Intuitive", "Creative"];
    const pillY = height * 0.72;
    const traitText = traits.join(" \u00B7 ");
    
    ctx.font = "16px sans-serif";
    const pillWidth = ctx.measureText(traitText).width + 40;
    
    // Pill background
    ctx.fillStyle = "rgba(242, 202, 80, 0.15)";
    ctx.beginPath();
    ctx.roundRect((width - pillWidth) / 2, pillY - 15, pillWidth, 36, 18);
    ctx.fill();
    
    // Pill border
    ctx.strokeStyle = "rgba(242, 202, 80, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect((width - pillWidth) / 2, pillY - 15, pillWidth, 36, 18);
    ctx.stroke();

    // Pill text
    ctx.fillStyle = "#F2CA50";
    ctx.textAlign = "center";
    ctx.fillText(traitText, width / 2, pillY + 7);

    // CTA text
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("What's YOUR cosmic archetype?", width / 2, height * 0.84);

    // Footer URL
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("sajuastrology.com", width / 2, height - 30);

    return canvas.toDataURL("image/png");
  }, [chart, dayMasterColor, archetypeContent]);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    const dataUrl = await generateShareImage();
    setIsGenerating(false);

    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `my-saju-archetype.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    }
  }, [generateShareImage]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/calculate?ref=share`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleTwitterShare = useCallback(() => {
    const archetype = encodeURIComponent(chart.archetype);
    const text = encodeURIComponent(`I'm ${chart.archetype} according to my Saju birth chart! What's your cosmic archetype?`);
    const url = encodeURIComponent("https://sajuastrology.com/calculate");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  }, [chart.archetype]);

  const handleFacebookShare = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://sajuastrology.com/calculate")}`,
      "_blank"
    );
  }, []);

  const handleWhatsAppShare = useCallback(() => {
    const text = encodeURIComponent(`I'm ${chart.archetype} on SajuAstrology! What's your cosmic archetype? https://sajuastrology.com/calculate`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [chart.archetype]);

  const handleRedditShare = useCallback(() => {
    const title = encodeURIComponent(`I'm ${chart.archetype} - Try this Korean Astrology test`);
    const url = encodeURIComponent("https://sajuastrology.com/calculate");
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, "_blank");
  }, [chart.archetype]);

  // Generate preview on mount
  useEffect(() => {
    if (isOpen) {
      generateShareImage();
    }
  }, [isOpen, generateShareImage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 m-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-foreground">Share Your Archetype</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Card */}
              <div className="relative bg-background rounded-xl overflow-hidden mb-6 flex justify-center">
                <div className="w-[300px] h-[400px]">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                    style={{ display: "block" }}
                  />
                </div>
              </div>

              {/* Share Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Image
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <Button
                  onClick={handleTwitterShare}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <TwitterIcon />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  onClick={handleFacebookShare}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <FacebookIcon />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button
                  onClick={handleWhatsAppShare}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <WhatsAppIcon />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button
                  onClick={handleRedditShare}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <RedditIcon />
                  <span className="text-xs">Reddit</span>
                </Button>
              </div>

              {/* Footer text */}
              <p className="text-sm text-muted-foreground text-center">
                Share your archetype and inspire others to discover theirs
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
