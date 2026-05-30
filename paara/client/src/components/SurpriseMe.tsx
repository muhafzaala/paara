import { useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X, RefreshCw } from "lucide-react";

const CRAFTS = [
  {
    city: "Multan", craft: "Blue Pottery", emoji: "🏺",
    fact: "Multan's blue pottery contains no clay — it's built entirely from quartz powder, giving it a translucent shimmer that clay can never achieve.",
    priceRange: "PKR 800 – 18,000", vibe: "Regal & Timeless",
  },
  {
    city: "Lahore", craft: "Khussa Shoes", emoji: "👟",
    fact: "A single pair of Lahori khussa can take up to 3 days to hand-stitch. The curled toe was originally designed so royalty could slip them on without bending.",
    priceRange: "PKR 1,800 – 6,500", vibe: "Bold & Playful",
  },
  {
    city: "Hunza", craft: "Walnut Wood Carving", emoji: "🪵",
    fact: "Hunza walnut trees grow for 200+ years before being harvested for carving. Each piece carries centuries of mountain air inside it.",
    priceRange: "PKR 2,500 – 45,000", vibe: "Earthy & Soulful",
  },
  {
    city: "Peshawar", craft: "Copper & Brass Work", emoji: "🔶",
    fact: "Peshawar's coppersmiths use a technique called repoussé — hammering patterns from the inside out — unchanged since the Mughal era.",
    priceRange: "PKR 2,000 – 25,000", vibe: "Ancient & Sturdy",
  },
  {
    city: "Hyderabad", craft: "Ajrak Block Print", emoji: "🧣",
    fact: "Ajrak takes 14 days to make. It's dipped in natural dye 16 times, and the indigo & madder colours actually deepen with each wash.",
    priceRange: "PKR 1,200 – 4,500", vibe: "Vivid & Cultural",
  },
  {
    city: "Wazirabad", craft: "Damascus Steel Cutlery", emoji: "🔪",
    fact: "Damascus steel's wave patterns appear because of layered folding — Wazirabad smiths fold the metal up to 300 times in a single blade.",
    priceRange: "PKR 3,500 – 12,000", vibe: "Sharp & Legendary",
  },
  {
    city: "Gilgit", craft: "Lapis Lazuli Jewellery", emoji: "💎",
    fact: "Lapis lazuli from Gilgit-Baltistan was exported to ancient Egypt. The blue in Tutankhamun's death mask came from Pakistan's mountains.",
    priceRange: "PKR 1,800 – 7,500", vibe: "Mystical & Rare",
  },
  {
    city: "Chiniot", craft: "Sheesham Furniture", emoji: "🪑",
    fact: "Chiniot has been Pakistan's furniture capital for 300 years. Its craftsmen can carve a full floral panel freehand — no stencil, no template.",
    priceRange: "PKR 15,000 – 150,000", vibe: "Grand & Heirloom",
  },
  {
    city: "Quetta", craft: "Balochi Mirror Embroidery", emoji: "✨",
    fact: "Balochi mirror-work is stitched with tiny convex mirrors that act as shields — the original belief was that evil spirits flee their own reflection.",
    priceRange: "PKR 1,200 – 40,000", vibe: "Fierce & Magical",
  },
  {
    city: "Swat", craft: "Emerald & Gemstones", emoji: "🟢",
    fact: "The Swat Valley produces some of the world's finest emeralds. Mughal emperors had Swat gems carved with their names and used them as royal seals.",
    priceRange: "PKR 2,000 – 35,000", vibe: "Precious & Storied",
  },
  {
    city: "Khushab", craft: "Salt Lamps", emoji: "🪔",
    fact: "The Khewra Salt Mine is 250 million years old — older than the Himalayas. Every lamp is carved from a single crystal formed before dinosaurs walked the Earth.",
    priceRange: "PKR 800 – 5,000", vibe: "Warm & Ancient",
  },
  {
    city: "Muzaffarabad", craft: "Pashmina Shawls", emoji: "🧤",
    fact: "One Pashmina shawl uses wool combed from 3 to 5 Changra goats — and takes a single weaver 2–4 weeks of full days to complete.",
    priceRange: "PKR 5,000 – 35,000", vibe: "Soft & Luxurious",
  },
];

function randomCraft(exclude?: number) {
  let idx: number;
  do { idx = Math.floor(Math.random() * CRAFTS.length); } while (idx === exclude && CRAFTS.length > 1);
  return { craft: CRAFTS[idx], idx };
}

export function SurpriseMe() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [current, setCurrent] = useState<{ craft: typeof CRAFTS[0]; idx: number } | null>(null);

  const reveal = useCallback((excludeIdx?: number) => {
    setSpinning(true);
    setTimeout(() => {
      setCurrent(randomCraft(excludeIdx));
      setSpinning(false);
    }, 380);
  }, []);

  const handleOpen = () => {
    reveal();
    setOpen(true);
  };

  const handleAgain = () => {
    reveal(current?.idx);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrent(null);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        aria-label="Surprise me with a Pakistani craft"
        className="sm-trigger"
      >
        <Sparkles size={20} />
        <span className="sm-trigger-label">Surprise Me</span>
      </button>

      {/* Overlay + Card */}
      {open && (
        <div className="sm-overlay" onClick={handleClose}>
          <div className="sm-card" onClick={(e) => e.stopPropagation()}>
            <button className="sm-close" onClick={handleClose} aria-label="Close">
              <X size={16} />
            </button>

            <div className="sm-eyebrow">✦ Craft of the Moment ✦</div>

            <div className={`sm-emoji-wrap ${spinning ? "sm-spinning" : "sm-pop"}`}>
              {current && <span className="sm-emoji">{current.craft.emoji}</span>}
            </div>

            {current && !spinning && (
              <div className="sm-body">
                <div className="sm-vibe">{current.craft.vibe}</div>
                <h2 className="sm-craft-name">{current.craft.craft}</h2>
                <p className="sm-city">from {current.craft.city}</p>
                <p className="sm-fact">{current.craft.fact}</p>
                <div className="sm-price">Starting from {current.craft.priceRange}</div>
                <div className="sm-actions">
                  <Link
                    to="/products"
                    search={{ city: current.craft.city } as any}
                    onClick={handleClose}
                    className="sm-btn-primary"
                  >
                    Shop this craft →
                  </Link>
                  <button onClick={handleAgain} className="sm-btn-secondary">
                    <RefreshCw size={13} /> Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
