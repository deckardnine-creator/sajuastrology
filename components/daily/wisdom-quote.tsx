"use client"

import { motion } from "framer-motion"

interface WisdomQuoteProps {
  quote: string
  author: string
}

export function WisdomQuote({ quote, author }: WisdomQuoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="text-center py-8"
    >
      <span className="text-4xl text-primary/30 font-serif">&ldquo;</span>
      <p className="font-serif text-lg italic text-muted-foreground max-w-2xl mx-auto px-4">
        {quote}
      </p>
      <span className="text-4xl text-primary/30 font-serif">&rdquo;</span>
      <p className="text-sm text-primary mt-4">— {author}</p>
    </motion.div>
  )
}
