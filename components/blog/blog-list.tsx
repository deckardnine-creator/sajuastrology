"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

const INITIAL_COUNT = 6;

export function BlogList() {
  const [expanded, setExpanded] = useState(false);

  const visiblePosts = expanded ? BLOG_POSTS : BLOG_POSTS.slice(0, INITIAL_COUNT);
  const hasMore = BLOG_POSTS.length > INITIAL_COUNT;

  return (
    <div className="space-y-6">
      {visiblePosts.map((post, i) => (
        <motion.div
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
        >
          <Link href={`/blog/${post.slug}`}>
            <article className="group bg-card/50 backdrop-blur border border-border hover:border-primary/30 rounded-xl p-5 sm:p-6 transition-all">
              <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
                <span>{post.date}</span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {post.keywords.slice(0, 3).map((kw) => (
                    <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
                <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          </Link>
        </motion.div>
      ))}

      {/* More button — expands to show remaining posts */}
      {hasMore && !expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-card/50 backdrop-blur border border-border hover:border-primary/30 rounded-full transition-all"
          >
            More
            <ChevronDown className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
