"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CosmicArchetypeCard } from "./cosmic-archetype-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const archetypes = [
  {
    archetype: "The Creator",
    element: "Wood",
    elementChinese: "甲",
    elementYinYang: "Yang",
    tags: ["Creative", "Expressive", "Independent", "Intuitive"],
  },
  {
    archetype: "The Commander",
    element: "Metal",
    elementChinese: "庚",
    elementYinYang: "Yang",
    tags: ["Decisive", "Disciplined", "Strategic", "Authoritative"],
  },
  {
    archetype: "The Adventurer",
    element: "Water",
    elementChinese: "壬",
    elementYinYang: "Yang",
    tags: ["Adaptable", "Wise", "Flowing", "Perceptive"],
  },
  {
    archetype: "The Builder",
    element: "Earth",
    elementChinese: "戊",
    elementYinYang: "Yang",
    tags: ["Stable", "Trustworthy", "Grounded", "Nurturing"],
  },
]

export function ShareCardGallery() {
  const [selectedArchetype, setSelectedArchetype] = useState(archetypes[0])
  const [variant, setVariant] = useState<"story" | "square">("story")

  return (
    <div className="space-y-12">
      {/* Variant Toggle */}
      <div className="flex justify-center">
        <Tabs
          value={variant}
          onValueChange={(v) => setVariant(v as "story" | "square")}
        >
          <TabsList className="glass">
            <TabsTrigger value="story">Story (9:16)</TabsTrigger>
            <TabsTrigger value="square">Square (1:1)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Card Preview */}
      <div className="flex justify-center">
        <CosmicArchetypeCard {...selectedArchetype} variant={variant} />
      </div>

      {/* Archetype Selector */}
      <div className="flex flex-wrap justify-center gap-4">
        {archetypes.map((archetype) => (
          <motion.button
            key={archetype.archetype}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedArchetype(archetype)}
            className={`glass rounded-xl px-6 py-3 text-sm font-medium transition-all ${
              selectedArchetype.archetype === archetype.archetype
                ? "glow-gold text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {archetype.archetype}
          </motion.button>
        ))}
      </div>

      {/* Download Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          size="lg"
          className="gold-gradient text-primary-foreground font-semibold"
        >
          Download for Instagram
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          Copy Share Link
        </Button>
      </div>
    </div>
  )
}
