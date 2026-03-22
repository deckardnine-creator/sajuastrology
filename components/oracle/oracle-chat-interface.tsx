"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Send, Lock, RefreshCw, ChevronLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { ELEMENTS, type Element } from "@/lib/saju-calculator";
import { detectCategory, getRandomResponse, fillTemplate, getDailyElement } from "@/lib/oracle-responses";

interface Message {
  id: string;
  role: "user" | "oracle";
  content: string;
  confidence?: number;
  timestamp: number;
}

const STORAGE_KEY = "saju-oracle-chat";
const QUESTIONS_KEY = "saju-oracle-questions";
const FREE_QUESTION_LIMIT = 3;

const SUGGESTED_QUESTIONS = [
  "Is this a good year to change careers?",
  "What's my financial outlook for this quarter?",
  "Am I compatible with a Fire-type partner?",
  "When should I make my next big move?",
  "What career path suits my archetype?",
  "How can I improve my relationships?",
];

export function OracleChatInterface() {
  const { sajuData, isPremium } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const FEEDBACK_KEY = "saju-oracle-feedback";

  // Handle client-side only initialization
  useEffect(() => {
    setMounted(true);
    
    // Load from localStorage only on client
    try {
      const savedChat = localStorage.getItem(STORAGE_KEY);
      const savedQuestions = localStorage.getItem(QUESTIONS_KEY);
      
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      }
      
      if (savedQuestions) {
        const count = parseInt(savedQuestions, 10);
        setQuestionsUsed(count);
        if (!isPremium && count >= FREE_QUESTION_LIMIT) {
          setShowUpgradeOverlay(true);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [isPremium]);

  // Save messages to localStorage
  useEffect(() => {
    if (mounted && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        // Ignore
      }
    }
  }, [messages, mounted]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getDominantElement = (): string => {
    if (!sajuData?.chart?.elementBalance) return "Earth";
    const elements = sajuData.chart.elementBalance;
    if (!elements || typeof elements !== 'object') return "Earth";
    let max = 0;
    let dominant = "Earth";
    for (const [el, val] of Object.entries(elements)) {
      if (typeof val === 'number' && val > max) {
        max = val;
        dominant = el;
      }
    }
    return dominant;
  };

  const generateResponse = (userMessage: string): Message => {
    const category = detectCategory(userMessage);
    const template = getRandomResponse(category);
    
    const variables = {
      userName: sajuData?.chart?.userName || "Seeker",
      dayMaster: sajuData?.chart?.dayMaster?.en || "Wood",
      dayMasterElement: sajuData?.chart?.dayMaster?.element || "Wood",
      archetype: sajuData?.chart?.archetype || "The Seeker",
      dominantElement: getDominantElement(),
      todayElement: getDailyElement(),
    };

    const content = fillTemplate(template.content, variables);

    return {
      id: (Date.now() + 1).toString(),
      role: "oracle",
      content,
      confidence: template.confidence + Math.floor(Math.random() * 5) - 2,
      timestamp: Date.now(),
    };
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    // Check free question limit
    if (!isPremium && questionsUsed >= FREE_QUESTION_LIMIT) {
      setShowUpgradeOverlay(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Update question count
    const newCount = questionsUsed + 1;
    setQuestionsUsed(newCount);
    try {
      localStorage.setItem(QUESTIONS_KEY, newCount.toString());
    } catch (e) {
      // Ignore
    }

    // Show typing indicator
    setIsTyping(true);

    // Generate response after delay
    setTimeout(() => {
      const oracleMessage = generateResponse(userMessage.content);
      setMessages(prev => [...prev, oracleMessage]);
      setIsTyping(false);

      // Check if limit reached
      if (!isPremium && newCount >= FREE_QUESTION_LIMIT) {
        setTimeout(() => setShowUpgradeOverlay(true), 1000);
      }
    }, 2000 + Math.random() * 1000);
  };

  const handleNewConsultation = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    const newFeedback = { ...feedback, [messageId]: type };
    setFeedback(newFeedback);
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(newFeedback));
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user has a reading
  if (!sajuData?.chart) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-serif text-foreground mb-2">
            Generate Your Reading First
          </h2>
          <p className="text-muted-foreground mb-6">
            The Oracle needs your cosmic blueprint to provide personalized guidance.
            Get your free Saju reading to unlock this feature.
          </p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground">
              Get Your Free Reading
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const chart = sajuData.chart;
  const dayMasterElement = chart.dayMaster.element as Element;
  const dayMasterColor = ELEMENTS[dayMasterElement]?.color || "#F2CA50";

  return (
    <div className="relative flex flex-col lg:flex-row h-full">
      {/* Left Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block w-80 border-r border-border bg-card p-6 overflow-y-auto">
        {/* User Profile Card */}
        <div className="glass-gold rounded-2xl p-5 mb-6">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Your Profile
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${dayMasterColor}20` }}
            >
              <span className="text-2xl font-serif" style={{ color: dayMasterColor }}>
                {chart.dayMaster.zh}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{chart.dayMaster.en}</p>
              <p className="text-sm text-primary">{chart.archetype}</p>
            </div>
          </div>
          
          {/* Mini Elements Chart */}
          <div className="space-y-2">
            {chart.elementBalance && Object.entries(chart.elementBalance).map(([element, value]) => {
              const elementValues = Object.values(chart.elementBalance || {}).filter((v): v is number => typeof v === 'number');
              const maxVal = elementValues.length > 0 ? Math.max(...elementValues) : 1;
              const numValue = typeof value === 'number' ? value : 0;
              const colors: Record<string, string> = {
                Wood: "bg-secondary",
                Fire: "bg-fire",
                Earth: "bg-primary",
                Metal: "bg-metal",
                Water: "bg-water",
              };
              return (
                <div key={element} className="flex items-center gap-2">
                  <span className="w-12 text-xs text-muted-foreground capitalize">
                    {element}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[element] || "bg-primary"} rounded-full transition-all`}
                      style={{ width: `${(numValue / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-xs text-muted-foreground text-right">
                    {numValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mb-6">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Suggested Questions
          </h3>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-3 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* New Consultation */}
        <Button variant="outline" className="w-full" onClick={handleNewConsultation}>
          <RefreshCw className="w-4 h-4 mr-2" />
          New Consultation
        </Button>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold">Oracle Chat</h1>
              <p className="text-xs text-muted-foreground">Personalized cosmic guidance</p>
            </div>
          </div>
          <Badge className="gold-gradient text-primary-foreground border-0">PREMIUM</Badge>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome State */}
          {messages.length === 0 && !isTyping && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-serif text-foreground mb-2">The Oracle Awaits</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Ask about career, love, wealth, or timing. I'll provide guidance based on your cosmic blueprint.
              </p>
              
              {/* Mobile Suggested Questions */}
              <div className="lg:hidden flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "user" ? (
                <div className="max-w-[80%] bg-card-elevated border border-border rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-foreground">{message.content}</p>
                </div>
              ) : (
                <div className="max-w-[85%] space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-medium">Oracle</span>
                  </div>
                  <div className="glass-gold rounded-2xl rounded-tl-sm px-4 py-4">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>
                    {message.confidence && (
                      <div className="flex items-center justify-between text-sm pt-3 mt-3 border-t border-border/50">
                        <span className="text-muted-foreground">Reading Confidence:</span>
                        <span className="text-primary font-semibold">{message.confidence}%</span>
                      </div>
                    )}
                    {/* Feedback prompt */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Was this insight helpful?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(message.id, "up")}
                          className={`p-1.5 rounded-lg transition-colors ${
                            feedback[message.id] === "up" 
                              ? "bg-primary/20 text-primary" 
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          aria-label="Helpful"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, "down")}
                          className={`p-1.5 rounded-lg transition-colors ${
                            feedback[message.id] === "down" 
                              ? "bg-destructive/20 text-destructive" 
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          aria-label="Not helpful"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Oracle</span>
                </div>
                <div className="glass-gold rounded-2xl rounded-tl-sm px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4">
          <div className="flex justify-center mb-3">
            {isPremium ? (
              <div className="flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary">Unlimited Oracle Access</span>
              </div>
            ) : (
              <div className="glass rounded-full px-4 py-1.5 text-sm text-muted-foreground">
                {questionsUsed} of {FREE_QUESTION_LIMIT} free questions used
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !isPremium && questionsUsed >= FREE_QUESTION_LIMIT
                  ? "Upgrade to Premium for more questions..."
                  : "Ask the Oracle about your path..."
              }
              className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              disabled={isTyping || (!isPremium && questionsUsed >= FREE_QUESTION_LIMIT)}
            />
            <Button
              type="submit"
              size="icon"
              className="gold-gradient text-primary-foreground h-12 w-12 rounded-xl"
              disabled={!input.trim() || isTyping || (!isPremium && questionsUsed >= FREE_QUESTION_LIMIT)}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Upgrade Overlay */}
      {showUpgradeOverlay && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif text-foreground mb-2">
              Free Questions Used
            </h2>
            <p className="text-muted-foreground mb-6">
              You've used your {FREE_QUESTION_LIMIT} free Oracle consultations.
              Upgrade to Premium for unlimited access to the Oracle's wisdom.
            </p>
            <div className="space-y-3">
              <Link href="/pricing" className="block">
                <Button className="w-full gold-gradient text-primary-foreground">
                  Upgrade to Premium — $9.99/mo
                </Button>
              </Link>
              <Link href="/daily">
                <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Continue exploring free features
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
