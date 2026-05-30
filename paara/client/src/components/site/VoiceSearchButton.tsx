import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface Props { onDark?: boolean; }

// SpeechRecognition types via window cast
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
};

function getSR(): (new () => SR) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceSearchButton({ onDark = false }: Props) {
  const [supported] = useState(() => !!getSR());
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();
  const srRef = useRef<SR | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    srRef.current?.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!supported) return null;

  const start = () => {
    try {
      const SRClass = getSR()!;
      const sr = new SRClass();
      const lang = localStorage.getItem("paara_lang") === "ur" ? "ur-PK" : "en-US";
      sr.lang = lang;
      sr.continuous = false;
      sr.interimResults = false;

      sr.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setListening(false);
          navigate({ to: "/products", search: { q: transcript } as any });
        }
      };
      sr.onend = () => setListening(false);
      sr.onerror = () => setListening(false);

      sr.start();
      srRef.current = sr;
      setListening(true);

      timeoutRef.current = setTimeout(() => {
        sr.stop();
        setListening(false);
      }, 6000);
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    srRef.current?.stop();
    setListening(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label="Search by voice / آواز سے تلاش"
      title="Search by voice / آواز سے تلاش"
      className="relative w-10 h-10 rounded-full grid place-items-center transition-all duration-300 hover:-translate-y-0.5"
      style={{
        border: `1.5px solid ${listening ? "rgba(139,26,26,0.5)" : onDark ? "rgba(245,237,216,0.3)" : "rgba(28,58,42,0.15)"}`,
        color: listening ? "#8B1A1A" : onDark ? "#F5EDD8" : "#1C3A2A",
        background: listening ? "rgba(139,26,26,0.08)" : onDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
      }}
    >
      {listening ? (
        <>
          <Mic size={16} className="animate-pulse" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#8B1A1A] animate-ping" />
        </>
      ) : (
        <MicOff size={16} />
      )}
    </button>
  );
}
