import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check, X, ArrowRight, RefreshCw } from "lucide-react";
import { QUIZ } from "@/data/heritageQuiz";
import { productsApi } from "@/lib/api";
import ProductImage from "@/components/ProductImage";
import { formatPKR } from "@/lib/products";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Heritage Quiz · PAARA" }] }),
  component: QuizPage,
});

function getTitle(score: number) {
  if (score >= 9) return "Heritage Connoisseur";
  if (score >= 7) return "Cultural Enthusiast";
  if (score >= 5) return "Curious Traveler";
  return "New to PAARA — let's explore";
}

function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [topRegion, setTopRegion] = useState("");

  const q = QUIZ[current];

  const { data: recommended } = useQuery({
    queryKey: ["quiz-recs", topRegion],
    enabled: done,
    queryFn: async () => {
      try {
        const res = await productsApi.search({ limit: 3, sort: "newest", ...(topRegion ? { region: topRegion } : {}) });
        return res.data?.products || [];
      } catch { return []; }
    },
  });

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = q.options[idx].correct;
    if (correct) {
      setScore((s) => s + 1);
      if (!topRegion) setTopRegion(q.regionTag);
    }
  };

  const handleNext = () => {
    if (current < QUIZ.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setDone(false); setTopRegion("");
  };

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Nav variant="solid" />
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-[640px]">

          {!done ? (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-[#6B645A] mb-2">
                  <span>Question {current + 1} of {QUIZ.length}</span>
                  <span>{score} correct</span>
                </div>
                <div className="h-2 rounded-full bg-white overflow-hidden">
                  <div className="h-full bg-[#C9921A] rounded-full transition-all duration-500"
                    style={{ width: `${((current + (answered ? 1 : 0)) / QUIZ.length) * 100}%` }} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}>

                  <h2 className="display-serif text-2xl md:text-3xl text-[#1C3A2A] mb-8 leading-snug">
                    {q.question}
                  </h2>

                  <div className="space-y-3">
                    {q.options.map((opt, i) => {
                      let bg = "bg-white border-[rgba(28,58,42,0.12)]";
                      let color = "text-[#1C3A2A]";
                      if (answered) {
                        if (opt.correct) { bg = "bg-[#D1FAE5] border-[#065F46]"; color = "text-[#065F46]"; }
                        else if (i === selected) { bg = "bg-[#FEE2E2] border-[#991B1B]"; color = "text-[#991B1B]"; }
                        else { bg = "bg-white border-[rgba(28,58,42,0.06)] opacity-50"; }
                      }
                      return (
                        <button key={i} type="button" onClick={() => handleSelect(i)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium text-sm flex items-center justify-between gap-3 ${bg} ${color} ${!answered ? "hover:border-[#C9921A] hover:-translate-y-0.5" : ""}`}>
                          <span>{opt.text}</span>
                          {answered && opt.correct && <Check size={16} className="shrink-0" />}
                          {answered && !opt.correct && i === selected && <X size={16} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="mt-6 p-4 rounded-2xl bg-[#FFF8EC] border border-[rgba(201,146,26,0.2)]">
                      <p className="text-sm text-[#1C3A2A] leading-relaxed">{q.explanation}</p>
                      <button type="button" onClick={handleNext}
                        className="btn btn-primary mt-4 flex items-center gap-2">
                        {current < QUIZ.length - 1 ? "Next question" : "See results"}
                        <ArrowRight size={15} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
              {/* Score */}
              <div className="bg-white rounded-[24px] p-10 border border-[rgba(28,58,42,0.08)] shadow-[var(--shadow-soft)]">
                <p className="eyebrow mb-2">Your score</p>
                <p className="font-display text-7xl font-bold text-[#C9921A]">{score}<span className="text-3xl text-[#6B645A]">/{QUIZ.length}</span></p>
                <p className="display-serif text-2xl text-[#1C3A2A] mt-4">{getTitle(score)}</p>
              </div>

              {/* Recommendations */}
              {(recommended?.length ?? 0) > 0 && (
                <div className="text-left">
                  <p className="eyebrow mb-4">Crafts you might love</p>
                  <div className="grid grid-cols-3 gap-4">
                    {(recommended ?? []).map((p: any) => (
                      <Link key={p._id} to="/products/$id" params={{ id: p._id }}
                        className="bg-white rounded-2xl overflow-hidden border border-[rgba(28,58,42,0.08)] hover:shadow-md transition-all block">
                        <div className="aspect-square relative">
                          <ProductImage src={p.images?.[0]} alt={p.name} size="sm" />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-[#1C3A2A] line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-[#C9921A] mt-0.5">{formatPKR(p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/products" search={{} as any} className="btn btn-primary">Browse all crafts <ArrowRight size={15} /></Link>
                <button type="button" onClick={reset} className="btn btn-secondary flex items-center gap-2">
                  <RefreshCw size={14} /> Retake quiz
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
