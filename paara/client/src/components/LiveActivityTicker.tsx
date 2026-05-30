import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";

const NAMES = ["Aisha", "Bilal", "Hassan", "Sara", "Zainab", "Imran", "Faria", "Usman", "Ahmed", "Mariam", "Yusuf", "Hira", "Adnan", "Layla", "Salman"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Multan", "Peshawar", "Quetta", "Faisalabad", "Hyderabad", "Sialkot", "Rawalpindi"];
const VERBS = ["is viewing", "just saved", "added to cart", "discovered"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildMessage(products: any[]): string {
  const name = pick(NAMES);
  const city = pick(CITIES);
  const verb = pick(VERBS);
  const product = pick(products);
  return `${name} in ${city} ${verb} ${product.name}`;
}

export default function LiveActivityTicker() {
  const { data } = useQuery({
    queryKey: ["live-ticker-products"],
    queryFn: async () => {
      try { return (await productsApi.search({ limit: 30, sort: "newest" })).data; }
      catch { return null; }
    },
    staleTime: 1000 * 60 * 10,
  });

  const products = data?.products;
  const [msg, setMsg] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!products?.length) return;
    setMsg(buildMessage(products));
    const id = setInterval(() => {
      setMsg(buildMessage(products));
      setIdx((i) => i + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [products]);

  if (!products?.length || !msg) return null;

  return (
    <div className="bg-[#FFF8EC] border-y border-[rgba(28,58,42,0.08)] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-2.5 flex items-center gap-3">
        <span className="text-[#C9921A] text-[10px] shrink-0 font-bold tracking-[0.18em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9921A] animate-pulse inline-block" />
          Live
        </span>
        <div className="flex-1 overflow-hidden relative h-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={idx}
              className="absolute inset-0 text-xs text-[#1C3A2A] font-medium whitespace-nowrap"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {msg}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
