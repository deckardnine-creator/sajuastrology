"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OracleInsightProps {
  insight: string
  confidence: number
}

export function OracleInsight({ insight, confidence }: OracleInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-3">Oracle Insight</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {insight}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm text-muted-foreground">
              Confidence Score:{" "}
              <span className="text-primary font-semibold">{confidence}%</span>
            </span>
            <Link href="/oracle">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Full Reading
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
