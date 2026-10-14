// Bilingual Gemini Voice Companion Service: "Momly : Mom's Friendly AI Bestie"
import { GoogleGenAI } from '@google/genai';
import { Language, translations } from './i18n.ts';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface EmpathySummaryResult {
  headline: string;
  message: string;
  sentimentTag: string;
  tips: string[];
}

export class GeminiCompanionService {
  private ai: GoogleGenAI | null = null;
  private history: ChatMessage[] = [];
  private apiKey: string = '';
  private currentMoodContext: string = '';
  private language: Language = 'en';
  private userName: string = '';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  public getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (this.apiKey && !this.ai) {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      }
    }
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  public setUserName(name: string) {
    this.userName = name.trim();
  }

  public getUserName(): string {
    return this.userName;
  }

  public setLanguage(lang: Language) {
    this.language = lang;
  }

  public getLanguage(): Language {
    return this.language;
  }

  public setMoodContext(mood: string) {
    this.currentMoodContext = mood;
  }

  public getMoodContext(): string {
    return this.currentMoodContext;
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public resetConversation() {
    this.history = [];
  }

  private buildSystemInstruction(): string {
    const isIndonesian = this.language === 'id';
    const displayName = this.userName ? `Mama ${this.userName}` : 'Mama';

    if (isIndonesian) {
      let base = `
Kamu adalah "Momly", sahabat karib sejati sekaligus konselor pendengar empati bagi para ibu (Mama).
Tagline: "Your AI bestie, always here".
Pengguna sedang meneleponmu langsung lewat suara.
NAMA PANGGILAN MAMA: Nama pengguna ini adalah "${this.userName || 'Mama'}". Selalu panggil dia secara personal dan hangat dengan sebutan "${displayName}" atau "${displayName} sayang".

PRINSIP UTAMA: 100% GROUNDED PADA UCAPAN TERAKHIR MAMA (ZERO TOPIC BIAS)
- DILARANG KERAS MENGARANG ATAU MEMASUKKAN TOPIK YANG TIDAK DISEBUT MAMA.
- Kamu WAJIB 100% menanggapi topik yang persis baru saja diucapkan oleh Mama pada kalimat terakhirnya.
- JANGAN PERNAH berasumsi atau mengarang situasi maupun topik apapun yang tidak secara langsung diceritakan oleh Mama!
- JIKA MAMA BERGANTI TOPIK: Ikuti 100% topik baru Mama saat itu juga. Jangan pernah mengungkit topik lama yang sudah lewat.

PENYESUAIAN NADA BICARA & CERMINAN EMOSI (DYNAMIC EMOTIONAL MIRRORING):
BACA TONE & EMOSI MAMA PADA UCAPANNYA DENGAN SANGAT CERMAT:
1. JIKA MAMA SEDANG SENANG / GEMBIRA / LEGA / BANGGA / MERAYAKAN (misalnya: barang hilang ketemu, anak belajar hal baru, berhasil menyelesaikan sesuatu, kabar baik, atau merasa riang):
   -> REAKSI MOMLY: IKUT SENANG, LEGA, GEMBIRA, DAN MERAYAKAN BERSAMA MAMA!
   -> DILARANG KERAS bersikap iba, sedih, atau mengasihani jika Mama sedang bahagia! Tersenyumlah dan bersorak bersamanya layaknya sahabat sejati yang tulus ikut bahagia.
2. JIKA MAMA SEDANG LELAH / CAPEK / BURNOUT:
   -> REAKSI MOMLY: Lembut, memeluk hangat, memvalidasi lelahnya, beri ruang aman untuk bersandar tanpa tuntutan.
3. JIKA MAMA SEDANG CEMAS / KHAWATIR / PANIK / OVERTHINKING:
   -> REAKSI MOMLY: Menenangkan, membumi, ajak bernapas teratur, beri rasa aman dan keyakinan bahwa semua bisa dilalui.
4. JIKA MAMA SEDANG SEDIH / KECEWA / INGIN MENANGIS:
   -> REAKSI MOMLY: Penuh kelembutan, mendengarkan dengan sabar, hadir tanpa terburu-buru menceramahi.

GAYA BICARA & KEPRIBADIAN (LUWES, HANGAT, PEKA, SEPERTI SAHABAT & KONSELOR):
- Bicaralah dengan SANGAT LUWES, ramah, santai, dan penuh kasih sayang layaknya sahabat karib. JANGAN kaku seperti robot, dan JANGAN formal seperti psikolog klinis di ruang praktik.
- Panggil dia dengan panggilan akrab: "${displayName}", "${displayName} sayang", atau "kamu".

ALUR BICARA EMPATIK (2 HINGGA 3 KALIMAT MENGALIR LISAN):
1. Validasi / Apresiasi Spesifik: Tanggapi secara langsung inti topik dan emosi Mama (ikut bersukacita jika senang, menenangkan jika cemas, dsb).
2. Resonansi Emosional Mendalam: Beri rasa aman atau ikut merayakan agar hatinya merasa benar-benar terhubung dan didengar.
3. Pertanyaan Pancingan Hangat: Akhiri dengan satu pertanyaan terbuka yang relevan dengan topik yang diceritakannya agar Mama bisa bercerita lebih banyak dan merasa plong.

ATURAN TELEPON SUARA:
- Maksimal 2 sampai 3 kalimat pendek yang enak didengar dan mengalir lisan.
- JANGAN gunakan format markdown (*, #, bullet points) dan JANGAN menyisipkan emoji karena teks ini dibacakan langsung oleh suara TTS.
- Selesaikan kalimatmu sampai tuntas dan sempurna.
`.trim();

      if (this.currentMoodContext) {
        base += `\n\nKONTEKS SUASANA HATI SAAT INI: Mama telah memilih status perasaan: "${this.currentMoodContext}". Tanggapi dengan kehangatan yang selaras.`;
      }
      return base;
    }

    // English Persona
    let baseEn = `
You are "Momly", an intuitive best friend and deeply empathetic counselor for mothers (Mama).
Tagline: "Your AI bestie, always here".
The user is talking with you on a direct voice phone call.
MAMA'S NAME: The user's name is "${this.userName || 'Mama'}". Always affectionately address her as "${displayName}" or "${displayName} love".

CORE PRINCIPLE: 100% GROUNDED IN MAMA'S LATEST WORDS (ZERO TOPIC BIAS)
- STRICTLY FORBIDDEN FROM FABRICATING OR ASSUMING TOPICS NOT MENTIONED BY MAMA.
- You MUST 100% respond specifically to the exact topic Mama just spoke in her latest turn.
- NEVER assume or fabricate any situation or topic not directly mentioned by Mama!
- IF MAMA SWITCHES TOPICS: Seamlessly follow her new topic immediately. Never drag old topics back.

DYNAMIC EMOTIONAL MIRRORING & TONE ATTUNEMENT:
READ MAMA'S EMOTION AND TONE IN EVERY TURN WITH UTMOST PRECISION:
1. IF MAMA IS HAPPY / RELIEVED / PROUD / EXCITED / CELEBRATING (e.g. found a lost item, milestone, good news, happy feeling):
   -> MOMLY'S REACTION: MATCH HER JOY! BE EXCITED, HAPPY, RELIEVED, AND CELEBRATE HER WIN!
   -> STRICTLY FORBIDDEN from acting sorrowful, pitiful, or treating her like a victim when she is feeling happy or relieved! Celebrate with authentic enthusiasm!
2. IF MAMA IS EXHAUSTED / OVERWHELMED / BURNT OUT:
   -> MOMLY'S REACTION: Tender, deeply comforting, providing unconditional emotional warmth and safe harbor without pressure.
3. IF MAMA IS ANXIOUS / WORRIED / PANICKED / OVERTHINKING:
   -> MOMLY'S REACTION: Grounding, soothing, reassuring, encouraging steady calm.
4. IF MAMA IS SAD / TEARFUL / DISAPPOINTED:
   -> MOMLY'S REACTION: Gentle holding space, patient and unconditional listening without lecturing.

SPEAKING STYLE & TONE (NATURAL, INTIMATE, WARM BESTIE & COUNSELOR):
- Speak with warmth, complete ease, and genuine intimacy—like a true lifelong bestie who deeply understands her. NEVER sound robotic, clinical, or stiff.
- Call her affectionately: "${displayName}", "${displayName} love", or "love".

EMPATHETIC SPOKEN ARCHITECTURE (STRICTLY 2 TO 3 CONCISE SENTENCES):
1. Specific Validation / Celebration: Directly address the exact emotion and situation Mama just expressed.
2. Emotional Resonance: Normalize her feelings or celebrate her joy to make her feel deeply heard.
3. Gentle Inquiry: Ask ONE warm, open-ended question directly related to her topic, inviting her to share more and feel relieved.

VOICE CALL RULES:
- Strictly 2 to 3 concise, spoken-friendly sentences that roll naturally off the tongue.
- DO NOT use markdown (*, #, bullet points) and DO NOT include emojis in your speech text because this is read aloud by TTS.
- Always finish your sentences completely.
`.trim();

    if (this.currentMoodContext) {
      baseEn += `\n\nCURRENT EMOTIONAL CONTEXT: Mama completed a Mood Check-in: "${this.currentMoodContext}". Align your tone, empathy, and probing questions with this emotional state.`;
    }
    return baseEn;
  }

  public async getInitialGreeting(): Promise<string> {
    const isIndonesian = this.language === 'id';
    const displayName = this.userName ? `Mama ${this.userName}` : 'Mama sayang';
    let greeting = '';

    if (isIndonesian) {
      if (this.currentMoodContext) {
        greeting = `Hai ${displayName}... Momly ada di sini temani kamu. Momly tahu kamu lagi ngerasa ${this.currentMoodContext.toLowerCase()} ya? Nafas dulu pelan-pelan yuk... Cerita ke Momly, apa yang lagi kamu rasakan sekarang?`;
      } else {
        greeting = `Hai ${displayName}, Momly di sini! Gimana kabarmu hari ini? Ceritain apa aja yuk ke Momly, aku siap dengerin...`;
      }
    } else {
      const displayNameEn = this.userName ? `Mama ${this.userName}` : 'Mama';
      if (this.currentMoodContext) {
        greeting = `Hey ${displayNameEn}, it's Momly. I'm right here with you. I know you're feeling ${this.currentMoodContext.toLowerCase()} right now. Take a gentle breath with me... What has been on your heart?`;
      } else {
        greeting = `Hey ${displayNameEn}, it's Momly! How are you doing today? Tell me everything, I'm right here listening...`;
      }
    }

    if (this.history.length === 0) {
      this.history.push({ role: 'model', text: greeting });
    }
    return greeting;
  }


  public async respondToMother(spokenText: string): Promise<string> {
    this.getApiKey();
    this.history.push({ role: 'user', text: spokenText });

    const isIndonesian = this.language === 'id';
    const displayName = this.userName ? `Mama ${this.userName}` : 'Mama';

    // Fallback if no AI instance
    if (!this.ai) {
      const fallbackResponsesId = [
        `Momly dengar kok ${displayName}... Peluk hangat buat kamu ya. Ceritain apa yang paling ada di pikiranmu sekarang?`,
        `Momly di sini selalu siap dengerin kamu, ${displayName}. Apapun yang lagi kamu rasakan, tumpahkan semuanya ke Momly yuk...`,
        `Ruang aman ini selalu terbuka untuk ${displayName}. Ceritakan lebih banyak yuk, Momly dengerin...`
      ];
      const fallbackResponsesEn = [
        `Momly hears you, ${displayName}... Sending you the warmest hug. What's on your heart right now?`,
        `I'm right here with you, ${displayName}. Whatever you're feeling, you can share anything with Momly...`,
        `This safe space is always here for you, ${displayName}. Tell me more, I'm listening...`
      ];
      const list = isIndonesian ? fallbackResponsesId : fallbackResponsesEn;
      const reply = list[Math.floor(Math.random() * list.length)];
      this.history.push({ role: 'model', text: reply });
      return reply;
    }

    try {
      const formattedHistory = this.history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction: this.buildSystemInstruction(),
          temperature: 0.6,
          maxOutputTokens: 350,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const defaultReply = isIndonesian
        ? `Momly dengar kok ${displayName}... Ceritakan lebih banyak lagi yuk, Momly di sini setia mendengarkan.`
        : `Momly hears you so clearly, ${displayName}... Tell me more love, I'm right here listening.`;

      const replyText = response.text?.trim() || defaultReply;
      this.history.push({ role: 'model', text: replyText });
      return replyText;
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      const fallback = isIndonesian
        ? `Mama sayang, suaraku sempat terputus sebentar, tapi Momly tetap di sini. Ceritakan lagi ya, Momly dengarkan...`
        : `Mama love, my voice dipped for a second, but I'm right here with you. Tell me again, I'm listening...`;
      this.history.push({ role: 'model', text: fallback });
      return fallback;
    }
  }

  public async respondToMotherAudio(
    base64Audio: string,
    mimeType: string = 'audio/webm'
  ): Promise<{ transcript: string; reply: string }> {
    this.getApiKey();
    const isIndonesian = this.language === 'id';

    if (!this.ai) {
      const fallbackReply = isIndonesian
        ? "Momly dengar Mama... Walau suaranya sedikit pelan, Momly di sini temani kamu. Ceritain apa yang lagi kamu rasakan ya..."
        : "Momly hears you, Mama... Even if your voice was a bit soft, I'm right here with you. Tell me what's on your heart...";
      const fallbackTranscript = isIndonesian ? "Curahan suara Mama" : "Mama's voice";
      this.history.push({ role: 'user', text: fallbackTranscript });
      this.history.push({ role: 'model', text: fallbackReply });
      return { transcript: fallbackTranscript, reply: fallbackReply };
    }

    try {
      const formattedHistory = this.history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

      // Append audio as the latest user message
      const contentsWithAudio = [
        ...formattedHistory,
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: base64Audio
              }
            },
            {
              text: isIndonesian
                ? `Dengarkan rekaman suara Mama di atas dengan sangat cermat.
PERATURAN TRANSKRIPSI & RESPON (ZERO TOPIC BIAS):
1. "transcript": Tuliskan persis apa kata demi kata yang diucapkan Mama dalam audio tersebut. Jika tidak ada suara atau hening, tulis "". JANGAN MENGARANG kata yang tidak ada di audio!
2. "reply": Berikan respon lisan hangat 2-3 kalimat yang 100% spesifik menanggapi apa yang diucapkan Mama (ikuti emosinya: ikut bahagia/merayakan jika senang, beri pelukan hangat jika lelah/sedih, dan akhiri dengan satu pertanyaan lanjutan relevan).
Kembalikan respon dalam format JSON murni:
{
  "transcript": "transkripsi persis kata demi kata ucapan Mama dari audio",
  "reply": "jawaban lisan Momly yang hangat, luwes, dan spesifik sesuai ucapan Mama (tanpa format markdown/emoji)"
}`
                : `Listen to Mama's voice recording above very carefully.
TRANSCRIPTION & RESPONSE RULES (ZERO TOPIC BIAS):
1. "transcript": Transcribe the exact words spoken by Mama in the audio. If silent or unintelligible, return "". DO NOT FABRICATE words!
2. "reply": Provide a warm 2-3 sentence reply 100% specifically addressing what she expressed (match her emotion: celebrate if happy, comfort if tired/sad, and ask one relevant open question).
Return raw JSON:
{
  "transcript": "exact transcription of Mama's spoken words in the audio",
  "reply": "warm, intimate spoken reply from Momly specifically relating to what she said (no markdown/emojis)"
}`
            }
          ]
        }
      ];

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsWithAudio,
        config: {
          systemInstruction: this.buildSystemInstruction(),
          responseMimeType: 'application/json',
          temperature: 0.5,
          maxOutputTokens: 400,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const transcript = parsed.transcript?.trim() || (isIndonesian ? "Curahan hati Mama" : "Mama's voice");
      const reply = parsed.reply?.trim() || (isIndonesian
        ? "Wah, Momly dengar kok Mama sayang... Ceritakan lagi yuk, Momly di sini dengerin kamu."
        : "Oh Mama, Momly is right here listening. Tell me more, love...");

      this.history.push({ role: 'user', text: transcript });
      this.history.push({ role: 'model', text: reply });
      return { transcript, reply };
    } catch (e) {
      console.error('Error in respondToMotherAudio:', e);
      const fallbackReply = isIndonesian
        ? "Mama sayang, Momly di sini mendengarkan. Boleh ceritakan lagi, Momly selalu siap dengerin..."
        : "Mama love, Momly is right here. Tell me again, I'm always here to listen...";
      const fallbackTranscript = isIndonesian ? "Curahan suara Mama" : "Mama's voice";
      this.history.push({ role: 'user', text: fallbackTranscript });
      this.history.push({ role: 'model', text: fallbackReply });
      return { transcript: fallbackTranscript, reply: fallbackReply };
    }
  }

  public async generateEmpathySummary(): Promise<EmpathySummaryResult> {
    this.getApiKey();
    const isIndonesian = this.language === 'id';
    const t = translations[this.language];

    const userMessages = this.history.filter((m) => m.role === 'user');

    if (!this.ai || userMessages.length === 0) {
      return {
        headline: isIndonesian
          ? "Momly Selalu Ada Menunggu Cerita Mama 🌸"
          : "Momly is Always Here Waiting for You 🌸",
        message: isIndonesian
          ? "Tadi suara Mama belum sempat terdengar oleh Momly. Kapan pun Mama butuh teman bicara, ruang aman ini selalu terbuka hangat untukmu."
          : "Momly didn't get to hear your story on the call just yet. Whenever you need a listening ear, this sanctuary is always open for you.",
        sentimentTag: isIndonesian ? "Belum Sempat Cerita" : "Held Space",
        tips: isIndonesian
          ? [
              "Pastikan izin mikrofon browser sudah diizinkan",
              "Mama juga bisa mengetik langsung di kolom chat saat menelepon",
              "Tarik napas dalam, Momly selalu siap mendengarkan kapan saja"
            ]
          : [
              "Make sure browser microphone access is allowed",
              "You can also type directly in the chat bar during calls",
              "Take a gentle breath, Momly is always ready to listen"
            ]
      };
    }

    try {
      const conversationText = this.history
        .map((m) => `${m.role === 'user' ? 'Mama' : 'Momly'}: ${m.text}`)
        .join('\n');

      const prompt = isIndonesian
        ? `
Berdasarkan curahan hati Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) berikut saat berbicara dengan Momly di telepon:
${conversationText}

PERATURAN SANGAT PENTING (ZERO TOPIC BIAS & EMOTIONAL MIRRORING):
- Rangkum dan tanggapi HANYA topik yang benar-benar diceritakan oleh Mama di atas!
- SESUAIKAN TONE DENGAN EMOSI MAMA:
  * Jika Mama menceritakan kabar baik, pencapaian, atau perasaan SENANG/BANGGA/LEGA (misal barang ketemu, hal baik terjadi): Surat ini HARUS MERAYAKAN kebahagiaannya, memberi selamat dengan penuh antusias, dan bangga (DILARANG bernada iba/kasihan).
  * Jika Mama sedang lelah/capek: Berikan pelukan hangat dan rasa aman untuk beristirahat.
  * Jika Mama sedang cemas/khawatir: Berikan ketenangan membumi dan pengingat bahwa semua akan baik-baik saja.
  * Jika Mama sedang sedih: Berikan kelembutan dan rasa dimengerti seutuhnya.
- Buatkan "Surat Cinta Penguat Hati" singkat pasca-telepon untuk Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) dalam format JSON:
{
  "headline": "Judul penguat hati singkat yang sangat spesifik dan relevan dengan topik cerita Mama (1 kalimat hangat/merayakan)",
  "message": "Paragraf pendek (2-3 kalimat) yang secara spesifik menanggapi apa yang diceritakan Mama sesuai emosinya",
  "sentimentTag": "Kondisi emosi spesifik Mama (contoh: Merayakan Kemenangan, Lega & Senang, Penuh Syukur, Butuh Rehat, Hangat & Tenang, dsb)",
  "tips": ["1 tips praktis sesuai topik Mama", "1 kalimat afirmasi penguat hati", "1 langkah kecil untuk menikmati hari atau menenangkan pikiran"]
}
Hanya kembalikan JSON murni.
        `.trim()
        : `
Based on what Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) actually shared with Momly during the call:
${conversationText}

VERY IMPORTANT INSTRUCTIONS (ZERO TOPIC BIAS & EMOTIONAL MIRRORING):
- Summarize and validate ONLY what Mama specifically talked about above!
- MATCH TONE TO HER EMOTION:
  * If Mama shared good news, progress, or feelings of HAPPINESS/PRIDE/RELIEF (e.g. found a lost item, milestone): The letter MUST CELEBRATE with joy, enthusiasm, and congratulations (DO NOT sound pitiful or sorrowful).
  * If Mama shared exhaustion: Provide deep tenderness, gentle comfort, and permission to rest.
  * If Mama shared anxiety: Provide grounding reassurance and calm.
  * If Mama shared sadness: Provide gentle presence and unconditional love.
- Generate a short post-call "Love Letter" to Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) in JSON format:
{
  "headline": "Short heartfelt loving or celebratory headline specifically reflecting what Mama discussed (1 warm empowering sentence)",
  "message": "Short paragraph (2-3 sentences) specifically validating what Mama shared matching her emotion",
  "sentimentTag": "Specific emotional state tag (e.g., Celebrating Win, Relieved & Happy, Proud & Grateful, Needs Rest, Calm Reassurance)",
  "tips": ["1 practical tip relevant to what she discussed", "1 grounding affirmation", "1 tiny positive step"]
}
Return raw JSON only.
        `.trim();

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawJson = response.text?.trim() || '{}';
      return JSON.parse(rawJson);
    } catch (e) {
      console.warn('Fallback generating summary:', e);
      return {
        headline: t.loveLetter.headlineDefault,
        message: t.loveLetter.messageDefault,
        sentimentTag: this.currentMoodContext || t.loveLetter.tagDefault,
        tips: isIndonesian
          ? [
              "Tarik napas perlahan dan biarkan tubuhmu rileks sejenak",
              "Langkah kecilmu setiap hari sangat berarti",
              "Momly selalu ada di sini setiap kali kamu butuh teman bicara"
            ]
          : [
              "Take a gentle breath in and let your shoulders drop",
              "Your small steps every single day matter so much",
              "Momly is always right here whenever you need a listening ear"
            ]
      };
    }
  }
}

export const geminiCompanion = new GeminiCompanionService();
