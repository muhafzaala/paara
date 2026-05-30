export interface QuizOption { text: string; correct: boolean; }
export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  regionTag: string;
  explanation: string;
}

const Q = (id: number, question: string, options: [string, boolean][], regionTag: string, explanation: string): QuizQuestion => ({
  id, question, options: options.map(([text, correct]) => ({ text, correct })), regionTag, explanation,
});

export const QUIZ: QuizQuestion[] = [
  Q(1, "Which city is famous for blue pottery (Kashi-kari)?",
    [["Karachi", false], ["Multan", true], ["Lahore", false], ["Peshawar", false]],
    "Punjab", "Multan's blue pottery uses quartz powder instead of clay, giving it a unique translucent finish. The cobalt glazes have been fired in the same kilns for centuries."),

  Q(2, "Ajrak is the cultural emblem of which province?",
    [["Punjab", false], ["Sindh", true], ["Khyber Pakhtunkhwa", false], ["Balochistan", false]],
    "Sindh", "Ajrak is a centuries-old resist-print textile dyed with indigo and madder. It takes 14 days to make and symbolises the Sindhi cultural identity."),

  Q(3, "Where does Pashmina come from?",
    [["Sindh", false], ["Punjab", false], ["Kashmir", true], ["Balochistan", false]],
    "AJK", "Pashmina is the finest cashmere, combed from Changra goats that live at altitudes above 4000m. Each shawl can take a weaver 2–4 weeks to complete by hand."),

  Q(4, "Which city is the world's hand-stitched football capital?",
    [["Lahore", false], ["Multan", false], ["Sialkot", true], ["Karachi", false]],
    "Punjab", "Sialkot produces 70–80% of the world's hand-stitched footballs, a tradition dating back to 1889 when a British soldier repaired the first ball here."),

  Q(5, "Khussa footwear traces to which Mughal court?",
    [["Delhi", false], ["Lahore", true], ["Agra", false], ["Hyderabad", false]],
    "Punjab", "The curled-toe khussa originated in Lahore's Mughal court. Each pair is hand-embroidered with zari thread and can take up to three days to stitch."),

  Q(6, "Lapis lazuli has been traded from which region for over 6,000 years?",
    [["Sindh", false], ["Punjab", false], ["Gilgit-Baltistan", true], ["Balochistan", false]],
    "Gilgit-Baltistan", "The Badakhshan mines in this region supplied lapis to ancient Egypt, Mesopotamia and Rome. The vivid blue in Tutankhamun's death mask is believed to be from this area."),

  Q(7, "Damascus steel cutlery in Pakistan comes from?",
    [["Sialkot", false], ["Wazirabad", true], ["Gujranwala", false], ["Karachi", false]],
    "Punjab", "Wazirabad smiths fold the steel up to 300 times to achieve Damascus steel's iconic wave pattern — a Mughal-era technique still practiced today."),

  Q(8, "Sohan halwa is most famously made in?",
    [["Karachi", false], ["Lahore", false], ["Multan", true], ["Peshawar", false]],
    "Punjab", "Sohan halwa is a dense, fudge-like confection made from flour, ghee, sugar and nuts. Multan's version has been made in the same families for generations."),

  Q(9, "Truck art is a folk tradition primarily from?",
    [["India", false], ["Pakistan", true], ["Iran", false], ["Afghanistan", false]],
    "Sindh", "Pakistan's truck art tradition began in the 1920s. Trucks are decorated with intricate floral motifs, calligraphy and portraits — a rolling gallery of folk art."),

  Q(10, "Naqashi (copper hammering / repoussé) is associated with?",
    [["Lahore", false], ["Peshawar", true], ["Karachi", false], ["Quetta", false]],
    "Khyber Pakhtunkhwa", "Peshawar's coppersmiths use repoussé — hammering patterns from the inside out — to create trays, samovars and pitchers. The technique is unchanged since the Mughal era."),
];
