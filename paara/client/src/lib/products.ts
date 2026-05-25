import multanImg from "@/assets/cities/Multan.jpg";
import lahoreImg from "@/assets/cities/Lahore.jpg";
import hunzaImg from "@/assets/cities/Hunza.jpg";
import peshawarImg from "@/assets/cities/Peshawar.jpg";
import karachiImg from "@/assets/cities/Karachi.jpg";
import skarduImg from "@/assets/cities/Skardu.jpg";
import balochImg from "@/assets/cities/Balochistan.jpg";
import gilgitImg from "@/assets/cities/Gilgit.jpg";
import islamabadImg from "@/assets/cities/Islamabad.jpg";
import faisalabadImg from "@/assets/cities/Faisalabad.jpg";
import mardanImg from "@/assets/cities/Mardan.jpg";
import mountainsImg from "@/assets/cities/Mountains.jpg";

import vaseImg from "@/assets/products/multan-blue-vase.jpg";
import trayImg from "@/assets/products/hunza-walnut-tray.jpg";
import ajrakImg from "@/assets/products/sindhi-ajrak-shawl.jpg";
import pitcherImg from "@/assets/products/peshawar-copper-pitcher.jpg";
import jadeImg from "@/assets/products/skardu-jade-bowl.jpg";
import phulkariImg from "@/assets/products/lahore-phulkari-runner.jpg";
import cushionImg from "@/assets/products/baloch-mirror-cushion.jpg";
import pendantImg from "@/assets/products/gilgit-silver-pendant.jpg";
import coastersImg from "@/assets/products/islamabad-marble-coasters.jpg";
import stoleImg from "@/assets/products/faisalabad-khaddar-stole.jpg";
import journalImg from "@/assets/products/mardan-leather-journal.jpg";
import lampImg from "@/assets/products/multan-camel-skin-lamp.jpg";
import pedeyImg from "@/assets/products/mardan-pedey.jpg";

export type Product = {
  id: string;
  name: string;
  artisan: string;
  region: string;
  category: string;
  material: string;
  price: number;
  img: string;
  gallery: string[];
  story: string;
  details: string;
  care: string;
};

export const REGIONS = [
  "Lahore", "Multan", "Hunza", "Peshawar", "Sindh / Karachi",
  "Skardu", "Gilgit", "Balochistan", "Islamabad", "Faisalabad", "Mardan",
] as const;

export const CATEGORIES = [
  "Pottery", "Textiles", "Woodwork", "Metalwork",
  "Jewellery", "Leather", "Stone & Gem", "Paper & Print",
  "Sweets & Confectionery",
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "multan-blue-vase",
    name: "Hand-Painted Blue Vase",
    artisan: "Ustad Naseer Ahmad",
    region: "Multan",
    category: "Pottery",
    material: "Glazed earthenware",
    price: 14500,
    img: vaseImg,
    gallery: [vaseImg, multanImg, lahoreImg, hunzaImg],
    story:
      "Painted in a courtyard kiln that has burned without pause for forty-one years. The cobalt is mixed by hand from a recipe Ustad Naseer's grandfather refused to ever write down.",
    details: "Height 32cm · Diameter 18cm · Approx. 1.4kg · Each piece is unique.",
    care: "Wipe with a soft, dry cloth. Avoid direct sunlight on the glaze. Not dishwasher safe.",
  },
  {
    id: "hunza-walnut-tray",
    name: "Walnut Wood Tea Tray",
    artisan: "Karim Wood Studio",
    region: "Hunza",
    category: "Woodwork",
    material: "Solid walnut, oil-finished",
    price: 9800,
    img: trayImg,
    gallery: [trayImg, hunzaImg, mountainsImg, skarduImg],
    story:
      "Carved from a single block of walnut harvested below 2,800 metres. The handles are joined without a single screw — a centuries-old wedged tenon.",
    details: "42 × 28 × 4cm · Food-safe linseed oil finish · Hand-signed underside.",
    care: "Wipe with a damp cloth. Re-oil annually. Never submerge.",
  },
  {
    id: "sindhi-ajrak-shawl",
    name: "Ajrak Cotton Shawl",
    artisan: "Sindhi Heritage House",
    region: "Sindh / Karachi",
    category: "Textiles",
    material: "Hand-loomed cotton",
    price: 6200,
    img: ajrakImg,
    gallery: [ajrakImg, karachiImg, faisalabadImg, multanImg],
    story:
      "Block-printed across sixteen separate dye baths over twenty-one days. The crimson is from madder root, the indigo from real plants — not pigment.",
    details: "210 × 90cm · Hand-loomed · Naturally dyed · Slight irregularities are not flaws.",
    care: "Cold hand-wash separately. Do not bleach. Dry flat in shade.",
  },
  {
    id: "peshawar-copper-pitcher",
    name: "Hammered Copper Pitcher",
    artisan: "Bukhari Brothers",
    region: "Peshawar",
    category: "Metalwork",
    material: "Solid copper, tin-lined",
    price: 11300,
    img: pitcherImg,
    gallery: [pitcherImg, peshawarImg, mardanImg, lahoreImg],
    story:
      "Hammered cold, by hand, on a stone anvil older than the founder. Each pitcher carries somewhere between 2,400 and 2,700 strikes.",
    details: "Height 28cm · Capacity 1.2L · Food-safe inner lining · Hand-signed base.",
    care: "Hand-wash with mild soap. Polish quarterly with lemon and salt. Avoid dishwashers.",
  },
  {
    id: "skardu-jade-bowl",
    name: "Skardu Jade Stone Bowl",
    artisan: "Baltistan Stoneworks",
    region: "Skardu",
    category: "Stone & Gem",
    material: "Polished mountain jade",
    price: 18900,
    img: jadeImg,
    gallery: [jadeImg, skarduImg, mountainsImg, gilgitImg],
    story:
      "Cut and polished from a single river-rolled stone in the Shigar valley. Two weeks at a wheel for one bowl.",
    details: "Diameter 16cm · Depth 6cm · Approx. 1.8kg · No two grains alike.",
    care: "Hand-wash. Polish with mineral oil to restore lustre.",
  },
  {
    id: "lahore-phulkari-runner",
    name: "Phulkari Embroidered Runner",
    artisan: "Anarkali Atelier",
    region: "Lahore",
    category: "Textiles",
    material: "Khaddar cotton, silk thread",
    price: 7400,
    img: phulkariImg,
    gallery: [phulkariImg, lahoreImg, faisalabadImg, mardanImg],
    story:
      "Twelve weeks of embroidery from a circle of women in old Lahore. The motif — sunflower — is from the maker's own grandmother's bridal trunk.",
    details: "180 × 40cm · Hand-embroidered · Each stitch counted.",
    care: "Dry-clean only. Roll, do not fold, for storage.",
  },
  {
    id: "baloch-mirror-cushion",
    name: "Balochi Mirror Work Cushion",
    artisan: "Quetta Hands Collective",
    region: "Balochistan",
    category: "Textiles",
    material: "Cotton, mirror, glass beads",
    price: 4800,
    img: cushionImg,
    gallery: [cushionImg, balochImg, peshawarImg, karachiImg],
    story:
      "Each tiny mirror is hand-set with a button-hole stitch. Forty mirrors, six women, one cushion cover.",
    details: "45 × 45cm · Removable cover · Insert sold separately.",
    care: "Spot clean only. Mirrors are glass — handle gently.",
  },
  {
    id: "gilgit-silver-pendant",
    name: "Hunza Silver Pendant",
    artisan: "Karakorum Silver",
    region: "Gilgit",
    category: "Jewellery",
    material: "Sterling silver, lapis",
    price: 8600,
    img: pendantImg,
    gallery: [pendantImg, gilgitImg, mountainsImg, hunzaImg],
    story:
      "Granulated silver-work and a single cabochon of Badakhshan lapis. Cast and finished by the same hands across three days.",
    details: "Pendant 3.5cm · 18-inch silver chain · Stamped 925.",
    care: "Wipe with a silver cloth. Store in the included pouch.",
  },
  {
    id: "islamabad-marble-coasters",
    name: "Margalla Marble Coasters (Set of 4)",
    artisan: "Northern Stone Works",
    region: "Islamabad",
    category: "Stone & Gem",
    material: "White Margalla marble, brass inlay",
    price: 5200,
    img: coastersImg,
    gallery: [coastersImg, islamabadImg, mountainsImg, lahoreImg],
    story:
      "Marble from the foothills behind the Margalla, inlaid by hand with brass petals in the Pietra Dura tradition.",
    details: "Diameter 10cm × 4 coasters · Felt-backed · Gift-boxed.",
    care: "Hand-wash. Re-wax annually for a deeper finish.",
  },
  {
    id: "faisalabad-khaddar-stole",
    name: "Khaddar Cotton Stole",
    artisan: "Lyallpur Looms",
    region: "Faisalabad",
    category: "Textiles",
    material: "Hand-loomed khaddar cotton",
    price: 3900,
    img: stoleImg,
    gallery: [stoleImg, faisalabadImg, karachiImg, lahoreImg],
    story:
      "Woven on a pit-loom in a small shed off the Jhang road. The yarn is hand-spun, so every stole has its own breath.",
    details: "200 × 70cm · Naturally dyed · Slubs are intentional.",
    care: "Cold hand-wash. Air dry. Iron on low.",
  },
  {
    id: "mardan-leather-journal",
    name: "Vegetable-Tan Leather Journal",
    artisan: "Pukhtoon Leather House",
    region: "Peshawar",
    category: "Leather",
    material: "Vegetable-tanned buffalo leather",
    price: 4400,
    img: journalImg,
    gallery: [journalImg, mardanImg, peshawarImg, lahoreImg],
    story:
      "Stitched on a 1962 Singer machine that has not missed a day of work. The leather is tanned in oak-bark pits over six months.",
    details: "A5 · 240 pages · Cotton paper · Bookmark ribbon.",
    care: "Conditions with use. Avoid prolonged water exposure.",
  },
  {
    id: "multan-camel-skin-lamp",
    name: "Camel Skin Painted Lamp",
    artisan: "Naqsh Studio Multan",
    region: "Multan",
    category: "Paper & Print",
    material: "Stretched camel skin, hand-painted",
    price: 5800,
    img: lampImg,
    gallery: [lampImg, multanImg, balochImg, peshawarImg],
    story:
      "A 300-year-old technique — a single piece of softened skin, stretched, dried, and painted with miniature ink work.",
    details: "Height 38cm · E27 fitting · Hand-painted, varies slightly.",
    care: "Dust gently. Keep away from humidity. Use low-heat LED bulbs only.",
  },
  {
    id: "mardan-ke-pedey",
    name: "Mardan Ke Pedey (Box of 12)",
    artisan: "Sheen Sweet House, Mardan",
    region: "Mardan",
    category: "Sweets & Confectionery",
    material: "Slow-cooked khoya, sugar, cardamom, pistachio",
    price: 2400,
    img: pedeyImg,
    gallery: [pedeyImg, mardanImg, peshawarImg, islamabadImg],
    story:
      "Mardan ke pedey are stirred in copper karahis for hours until the milk caramelises into a deep, nutty gold. The recipe — half a teaspoon of green cardamom, a pinch of saffron, no shortcuts — has stayed in the same Mardan family since 1958.",
    details: "Box of 12 pieces · Approx. 480g · Made fresh, dispatched within 24 hours.",
    care: "Best within 5 days. Refrigerate to keep up to 2 weeks. Bring to room temperature before serving.",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}
