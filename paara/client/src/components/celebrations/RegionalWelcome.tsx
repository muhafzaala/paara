import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { getGreetingFor } from "@/lib/regionalGreeting";
import CulturalDancers from "./CulturalDancers";

const SIGN_IN_FLAG = "paara_just_signed_in";
const DURATION_MS = 8000;

export default function RegionalWelcome() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(DURATION_MS / 1000));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "buyer") return;
    if (!sessionStorage.getItem(SIGN_IN_FLAG)) return;
    sessionStorage.removeItem(SIGN_IN_FLAG);

    const showTimer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(showTimer);
  }, [user]);

  useEffect(() => {
    if (!visible) return;
    timeoutRef.current = setTimeout(() => dismiss(), DURATION_MS);
    intervalRef.current = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
  };

  if (!user || user.role !== "buyer") return null;
  const greeting = getGreetingFor(user);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(15,34,25,0.94) 0%, rgba(28,58,42,0.9) 50%, rgba(15,34,25,0.96) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={dismiss}
        >
          {/* confetti */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 0, x: Math.random() * window.innerWidth }}
              animate={{ opacity: [0, 1, 0], y: -window.innerHeight - 80 }}
              transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 2, repeat: Infinity }}
              className="pointer-events-none absolute bottom-0 w-2 h-2 rounded-full"
              style={{ background: i % 2 ? "#C9921A" : "#F5EDD8", opacity: 0.7 }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative max-w-2xl w-full mx-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss welcome"
              className="absolute -top-2 right-0 sm:right-2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-[#F5EDD8] transition-colors"
            >
              <X size={16} />
            </button>

            <p className="text-[#C9921A] text-xs uppercase tracking-[0.32em] font-bold mb-4">PAARA</p>

            <motion.h1
              dir={greeting.dir}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
              className="font-display font-bold leading-[1.1] mb-3"
              style={{
                color: "#C9921A",
                fontSize: "clamp(56px, 11vw, 116px)",
                textShadow: "0 6px 28px rgba(201,146,26,0.35)",
              }}
            >
              {greeting.primary}
            </motion.h1>

            <p className="text-[#F5EDD8]/80 text-xs uppercase tracking-[0.22em] font-semibold mb-2">{greeting.language}</p>
            <p className="text-[#F5EDD8] text-base sm:text-lg mb-6">{greeting.subtitle}</p>

            <div className="mx-auto" style={{ maxWidth: 600 }}>
              <CulturalDancers region={greeting.dancersRegion} />
            </div>

            {/* countdown */}
            <div className="absolute bottom-2 right-2 sm:right-4 text-[#F5EDD8]/60 text-xs font-mono">
              {secondsLeft}s
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
