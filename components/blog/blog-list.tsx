"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

export function BlogList() {
  return (
    <div className="space-y-6">
      {BLOG_POSTS.map((post, i) => (
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
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
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
    </div>
  );
}
