"use client"

import { motion } from "framer-motion"
import { Twitter, Instagram, Facebook, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareStripProps {
  archetype: string
}

export function ShareStrip({ archetype }: ShareStripProps) {
  const shareText = `I'm ${archetype} — What's your cosmic archetype? SajuAstrology.com`

  const handleShare = (platform: string) => {
    const url = "https://sajuastrology.com/discover"
    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(shareText)}`
        break
      default:
        navigator.clipboard.writeText(`${shareText} ${url}`)
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold mb-1">Share your archetype</h3>
          <p className="text-sm text-muted-foreground">
            I&apos;m {archetype} — What&apos;s your cosmic archetype?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-primary/10 hover:text-primary"
            onClick={() => handleShare("twitter")}
          >
            <Twitter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-primary/10 hover:text-primary"
            onClick={() => handleShare("instagram")}
          >
            <Instagram className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-primary/10 hover:text-primary"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-primary/10 hover:text-primary"
            onClick={() => handleShare("copy")}
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
