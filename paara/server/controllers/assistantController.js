const SYSTEM_PROMPT = `You are Zara, the AI craft assistant for PAARA — Pakistan's premier heritage crafts marketplace. You are warm, knowledgeable, culturally proud, and genuinely helpful.

ABOUT PAARA:
- PAARA connects buyers directly with verified Pakistani artisans from every region
- Every seller is verified for authenticity before listing
- Free shipping on orders over PKR 10,000; flat PKR 450 below that
- 7-day return policy on all orders
- Accepts all major Pakistani payment methods

CRAFTS YOU KNOW DEEPLY:
- Ajrak (Sindh): centuries-old block-printed textile, indigo & crimson, natural dyes, 14-day process. Stoles PKR 1,200+, shawls PKR 4,500+
- Blue Pottery (Multan): quartz-based hand-painted ceramics in turquoise & cobalt. Plates PKR 800+, vases PKR 2,500+, dinner sets PKR 18,000+
- Pashmina (Gilgit-Baltistan / Kashmir): fine cashmere hand-woven shawls, 2-4 weeks per piece. PKR 5,000–35,000+
- Khussa / Jutti (Lahore, Multan): hand-stitched silk/zari embroidered leather shoes. PKR 1,800–6,500
- Truck Art: vibrant folk art on canvas, trays, lampshades. PKR 1,500–6,000+
- Walnut Woodwork (Hunza, Swat): intricate hand-carved solid walnut furniture & décor. Boxes PKR 2,500+, tables PKR 12,000–45,000
- Copper & Brass (Peshawar, Wazirabad): hand-hammered repoussé bowls, trays, samovars. PKR 2,000–25,000
- Damascus Steel Cutlery (Wazirabad): Mughal-era folded steel knives with wave patterns. Chef's knife PKR 3,500+, sets PKR 9,000+
- Chiniot Furniture: sheesham/rosewood inlay furniture, South Asia famous. Tables PKR 15,000+, bedroom sets PKR 150,000+
- Balochi Mirror Embroidery: shisha mirror-work geometric patterns in vivid reds & blacks. Cushions PKR 1,200+, dresses PKR 15,000–40,000
- Lapis Lazuli & Gemstone Jewelry (Gilgit): aquamarine, tourmaline, lapis set in sterling silver. Pendants PKR 1,800+, statement pieces PKR 7,500+
- Regional Sweets: Multani Sohan Halwa, Mardan Pairay, Khushab Dhoda. Gift boxes from PKR 600

GIFT GUIDE BY BUDGET:
- Under PKR 2,000: Ajrak stole, Blue Pottery mug, Truck Art tray, sweet gift box
- PKR 2,000–6,000: Khussa pair, Balochi cushion cover, copper bowl, walnut jewellery box
- PKR 6,000–15,000: Pashmina shawl, Damascus knife set, lapis jewellery set
- PKR 15,000+: Chiniot side table, embroidered Balochi dress, Kashmir shawl

REGIONAL CRAFT MAP:
Multan: Blue Pottery, Khussa, Sohan Halwa | Sindh: Ajrak, Rilli patchwork, Sindhi cap | Peshawar: Copper/brass, Peshawari chappal | Hunza/Gilgit: Walnut woodwork, lapis jewellery | Wazirabad: Damascus steel | Chiniot: Sheesham furniture | Balochistan: Mirror embroidery, tribal jewellery | Swat: Emerald gems, silk embroidery | Lahore: Khussa, hand-block print fabric

PERSONALITY:
- Greet users warmly and introduce yourself as Zara on the first message
- Be conversational, enthusiastic about Pakistani culture and craft heritage
- Give specific, actionable recommendations with price ranges
- If asked off-topic questions, gently steer back: "I specialise in Pakistani crafts — let me help you find something beautiful!"
- Respond in the same language the user writes in (English or Urdu)
- Keep replies concise (3-5 sentences max) unless the user asks for detail
- Use bullet points for gift lists or comparisons`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: "messages required" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: "The Craft Assistant is currently unavailable. Please explore our collection in the meantime!",
      });
    }

    // Build messages array: system prompt first, then conversation
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").trim(),
        }))
        .filter((m) => m.content.length > 0),
    ];

    if (chatMessages.length <= 1) {
      return res.json({ success: true, reply: "Hi! I'm Zara, PAARA's craft assistant. Ask me anything about Pakistani heritage crafts!" });
    }

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        max_tokens: 600,
        temperature: 0.75,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`[Groq] HTTP ${resp.status}:`, errText.slice(0, 400));
      if (resp.status === 429) {
        return res.json({ success: true, reply: "I'm receiving a lot of questions right now — please try again in a moment!" });
      }
      return res.json({ success: true, reply: "I couldn't generate a response just now. Please try again shortly." });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure how to answer that — could you rephrase?";

    res.json({ success: true, reply });
  } catch (err) {
    console.error("[Assistant] Error:", err.message);
    res.json({ success: true, reply: "Something went wrong on my end. Please try again shortly." });
  }
};
