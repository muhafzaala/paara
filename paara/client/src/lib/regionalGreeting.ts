export type RegionKey =
  | "Punjab" | "Sindh" | "Khyber Pakhtunkhwa" | "Balochistan"
  | "Gilgit-Baltistan" | "Azad Jammu & Kashmir" | "Islamabad"
  | "fallback";

interface Greeting {
  primary: string;
  language: string;
  subtitle: string;
  dir: "ltr" | "rtl";
  dancersRegion: string;
}

export const REGIONAL_GREETINGS: Record<RegionKey, Greeting> = {
  "Punjab": {
    primary: "جی آیاں نوں",
    language: "Punjabi · پنجابی",
    subtitle: "Welcome home — your heritage awaits",
    dir: "rtl",
    dancersRegion: "Punjab",
  },
  "Sindh": {
    primary: "ادب آداب",
    language: "Sindhi · سنڌي",
    subtitle: "Welcome — the spirit of Sindh greets you",
    dir: "rtl",
    dancersRegion: "Sindh",
  },
  "Khyber Pakhtunkhwa": {
    primary: "پاخیر راغلے",
    language: "Pashto · پښتو",
    subtitle: "Pakheyr Raghle — welcome to PAARA",
    dir: "rtl",
    dancersRegion: "Khyber Pakhtunkhwa",
  },
  "Balochistan": {
    primary: "خوش آتکَیں",
    language: "Balochi · بلوچی",
    subtitle: "Welcome — the warmth of Balochistan",
    dir: "rtl",
    dancersRegion: "Balochistan",
  },
  "Gilgit-Baltistan": {
    primary: "شپوون مبارک",
    language: "Shina · شینا",
    subtitle: "Welcome — greetings from the Karakoram",
    dir: "rtl",
    dancersRegion: "Gilgit-Baltistan",
  },
  "Azad Jammu & Kashmir": {
    primary: "سلام والیکم",
    language: "Kashmiri · کٲشُر",
    subtitle: "Welcome — the valley greets you",
    dir: "rtl",
    dancersRegion: "AJK",
  },
  "Islamabad": {
    primary: "خوش آمدید",
    language: "Urdu · اردو",
    subtitle: "Welcome to PAARA",
    dir: "rtl",
    dancersRegion: "Islamabad",
  },
  "fallback": {
    primary: "خوش آمدید",
    language: "Urdu · اردو",
    subtitle: "Welcome to PAARA — Pakistan's heritage marketplace",
    dir: "rtl",
    dancersRegion: "Islamabad",
  },
};

const CITY_TO_REGION: Record<string, RegionKey> = {
  // Punjab
  "lahore": "Punjab", "multan": "Punjab", "faisalabad": "Punjab", "rawalpindi": "Punjab",
  "gujranwala": "Punjab", "sialkot": "Punjab", "wazirabad": "Punjab", "chiniot": "Punjab",
  "bahawalpur": "Punjab", "khushab": "Punjab", "sargodha": "Punjab", "okara": "Punjab",
  "sahiwal": "Punjab", "jhelum": "Punjab", "gujrat": "Punjab",
  // Sindh
  "karachi": "Sindh", "hyderabad": "Sindh", "sukkur": "Sindh", "larkana": "Sindh",
  "mirpur khas": "Sindh", "nawabshah": "Sindh", "thatta": "Sindh",
  // KPK
  "peshawar": "Khyber Pakhtunkhwa", "mardan": "Khyber Pakhtunkhwa",
  "abbottabad": "Khyber Pakhtunkhwa", "mingora": "Khyber Pakhtunkhwa",
  "kohat": "Khyber Pakhtunkhwa", "bannu": "Khyber Pakhtunkhwa",
  "swat": "Khyber Pakhtunkhwa", "dera ismail khan": "Khyber Pakhtunkhwa",
  // Balochistan
  "quetta": "Balochistan", "gwadar": "Balochistan", "turbat": "Balochistan",
  "khuzdar": "Balochistan", "chaman": "Balochistan",
  // GB
  "gilgit": "Gilgit-Baltistan", "skardu": "Gilgit-Baltistan", "hunza": "Gilgit-Baltistan",
  "chilas": "Gilgit-Baltistan",
  // AJK
  "muzaffarabad": "Azad Jammu & Kashmir", "mirpur": "Azad Jammu & Kashmir",
  "kotli": "Azad Jammu & Kashmir",
  // Islamabad
  "islamabad": "Islamabad",
};

export function resolveRegion(user: any): RegionKey {
  if (!user) return "fallback";
  if (user.region && (user.region as string) in REGIONAL_GREETINGS) {
    return user.region as RegionKey;
  }
  if (user.city) {
    const key = String(user.city).trim().toLowerCase();
    if (key in CITY_TO_REGION) return CITY_TO_REGION[key];
  }
  const firstAddr = Array.isArray(user.addresses) ? user.addresses[0] : null;
  if (firstAddr) {
    if (firstAddr.province && (firstAddr.province as string) in REGIONAL_GREETINGS) {
      return firstAddr.province as RegionKey;
    }
    if (firstAddr.city) {
      const key = String(firstAddr.city).trim().toLowerCase();
      if (key in CITY_TO_REGION) return CITY_TO_REGION[key];
    }
  }
  try {
    const lang = navigator.language?.toLowerCase() || "";
    if (lang.startsWith("pa")) return "Punjab";
    if (lang.startsWith("sd")) return "Sindh";
    if (lang.startsWith("ps")) return "Khyber Pakhtunkhwa";
    if (lang.startsWith("ur")) return "Islamabad";
  } catch { /* noop */ }
  return "fallback";
}

export function getGreetingFor(user: any): Greeting {
  const key = resolveRegion(user);
  return REGIONAL_GREETINGS[key] || REGIONAL_GREETINGS.fallback;
}
