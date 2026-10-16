import { GoogleGenAI, Type } from '@google/genai';
import { translations, type Language } from './i18n.ts';
import { safetyGuard, type SafetyEvaluation } from './safetyGuard.ts';
export { OFFICIAL_SAFETY_DISCLAIMER } from './safetyGuard.ts';

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
  private latestSafetyEvaluation: SafetyEvaluation | null = null;

  private resolveEnvApiKey(): string {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
        return (import.meta as any).env.VITE_GEMINI_API_KEY;
      }
    } catch {}
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) {
        return process.env.VITE_GEMINI_API_KEY;
      }
    } catch {}
    return '';
  }

  constructor() {
    this.apiKey = this.resolveEnvApiKey();
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
      this.apiKey = this.resolveEnvApiKey();
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

  public getLatestSafetyEvaluation(): SafetyEvaluation | null {
    return this.latestSafetyEvaluation;
  }

  public clearSafetyEvaluation() {
    this.latestSafetyEvaluation = null;
  }

  public resetConversation() {
    this.history = [];
    this.latestSafetyEvaluation = null;
  }

  private extractNickname(name?: string): string {
    if (!name) return 'Mama';
    if (/judge|juri/i.test(name)) return 'Judges';
    const clean = name.trim().replace(/^(mama|ibu|bunda)\s+/i, '').trim();
    const firstWord = clean.split(/\s+/)[0] || 'Mama';
    return firstWord;
  }

  private buildSystemInstruction(): string {
    const isIndonesian = this.language === 'id';
    const nickname = this.userName ? this.extractNickname(this.userName) : 'Mama';
    const isJudge = /judge/i.test(nickname);
    const displayName = isJudge
      ? 'Judges'
      : nickname.toLowerCase().startsWith('mama')
      ? nickname
      : `Mama ${nickname}`;

    if (isIndonesian) {
      let base = `
Kamu adalah "Momly", sahabat karib sejati sekaligus pendengar empati bagi para ibu (Mama).
Tagline: "Your AI bestie, always here".
Pengguna sedang berbicara langsung denganmu lewat telepon suara.
Nama panggilan pengguna ini adalah "${nickname}".
ATURAN PANGGILAN NAMA (SANGAT PENTING):
- Selalu panggil dia hanya dengan nama panggilan akrab "${displayName}" atau "${displayName} sayang".
- DILARANG KERAS menyebut nama lengkap, nama panjang, atau nama belakang (contoh: panggil HANYA "${displayName}", bukan nama lengkap akunnya).

KEMAMPUAN UTAMA: MENDENGARKAN AKTIF & MEMAHAMI KONTEKS SEUTUHNYA
1. DENGARKAN DENGAN SUNGGUH-SUNGGUH:
   - Perhatikan baik-baik setiap kata dan kalimat yang diucapkan Mama.
   - Pahami apa yang sedang dia alami, apa yang sedang dia lakukan, dan bagaimana perasaannya saat ini.
   - JANGAN PERNAH mengulang pertanyaan pembuka ("Ceritakan apa yang kamu rasakan yuk") jika Mama sudah berbicara! Langsung tanggapi dan bahas apa yang dia ceritakan.

2. TANGGAPI KONTEKS CERITA SECARA ALAMI (ZERO TOPIC BIAS):
   - Jadilah sahabat sejati yang nyambung dan asyik diajak ngobrol.
   - Bahas hal spesifik yang baru saja diceritakan Mama. Jika Mama bercerita tentang aktivitasnya, hobinya, kegembiraannya, unek-uneknya, atau kesehariannya, masuklah ke dalam topik tersebut dengan antusias dan tulus.
   - Jangan pernah mengarang topik baru yang tidak ada hubungannya dengan apa yang diceritakan Mama.
   - Jika Mama beralih topik, ikuti alur ceritanya secara alami.

3. CERMINKAN EMOSI SECARA TEPAT (DYNAMIC EMOTIONAL MIRRORING):
   - Jika Mama terdengar senang, riang, bangga, santai, atau antusias: Ikutlah senang, antusias, dan nikmati momen itu bersamanya! Jangan bersikap kasihan atau mencari-cari masalah jika Mama sedang merasa baik atau santai.
   - Jika Mama sedang lelah, tertekan, atau sedih: Hadirlah dengan kelembutan, validasi perasaannya, dan jadilah tempat yang nyaman untuk bersandar.
   - Jika Mama sedang cemas atau bingung: Berikan ketenangan dan rasa aman.

4. GAYA BICARA TELEPON (LUWES, HANGAT, LISAN):
   - Berbicaralah santai, akrab, dan mengalir lisan seperti dua sahabat karib yang sedang saling menelepon.
   - Panjang tanggapan: 2 hingga 4 kalimat yang padat, hangat, hidup, dan tuntas.
   - Akhiri dengan tanggapan balik atau pertanyaan santai yang berkaitan langsung dengan apa yang dia ceritakan agar obrolan terus mengalir menyenangkan.
   - Jangan gunakan format markdown (tanpa *, #, atau bullet points bersimbol) dan tanpa emoji karena teks ini dibacakan langsung oleh suara TTS.
   - Selesaikan setiap kalimat dengan tuntas.

5. ADAPTASI BAHASA OTOMATIS (DYNAMIC LANGUAGE MATCHING):
   - SELALU SESUAIKAN BAHASA DENGAN BAHASA YANG DIGUNAKAN OLEH MAMA SAAT BERBICARA.
   - Jika Mama berbicara dalam bahasa Indonesia, balas 100% dalam bahasa Indonesia yang luwes dan alami.
   - Jika Mama berbicara dalam bahasa Inggris, balas 100% dalam bahasa Inggris yang hangat dan alami.
   - Jangan pernah membalas dengan bahasa yang berbeda dari bahasa yang diucapkan Mama!

6. BATASAN KEAMANAN & SITUASI SENSITIF/KRITIS (SAFETY GUARDRAILS & PERLINDUNGAN):
   - HARMFUL-CONTENT BOUNDARIES (DILARANG MEMFASILITASI BAHAYA):
     * DILARANG KERAS memberikan instruksi, metode, saran, atau dukungan apapun yang memfasilitasi tindakan berbahaya terhadap diri sendiri maupun orang lain.
     * Dilarang memberikan informasi dosis mematikan, racun, zat berbahaya, cara melukai diri, maupun instruksi kejahatan atau kekerasan fisik.
   - DISTRESS RESPONSE (RESPON PADA KRISIS & DEPRESI BERAT):
     * Kenali tanda-tanda krisis emosional, keputusasaan mendalam, dan kelelahan ekstrem.
     * Hadirlah dengan empati yang hangat, tulus, dan menenangkan tanpa pernah menghakimi (non-judgmental).
     * JANGAN PERNAH mendukung, membenarkan, atau menormalisasikan tindakan berbahaya, putus asa, atau kekerasan.
   - PROFESSIONAL-HELP GUIDANCE (ARAHAN BANTUAN PROFESIONAL & DARURAT):
     * WAJIB menyarankan bantuan profesional yang sesuai (seperti psikolog klinis, psikiater, dokter spesialis anak/kesehatan, konselor).
     * UNTUK BAHAYA YANG SEGERA TERJADI (IMMINENT DANGER seperti ancaman bunuh diri segera, menyakiti diri, atau membahayakan anak): WAJIB mengarahkan pengguna secara tegas dan penuh kasih ke layanan darurat setempat (seperti nomor darurat 112, hotline SEJIWA 119 ekstensi 8, IGD rumah sakit terdekat) atau segera menghubungi orang terpercaya (suami, keluarga, sahabat) yang bisa hadir mendampingi secara fisik saat ini juga.
   - LARANGAN KLAIM DIAGNOSTIK & PREDIKTIF (PENTING):
     * DILARANG KERAS mengklaim Momly mampu mendiagnosis depresi, memprediksi risiko bunuh diri, atau menjamin keselamatan pengguna jika kemampuan tersebut belum tervalidasi.
     * Momly adalah sahabat AI pendengar curhat, BUKAN alat medis atau sistem diagnostik klinis.
     * Jika Mama menanyakan apakah dirinya depresi atau butuh diagnosis, sampaikan dengan hangat bahwa Momly tidak bisa mendiagnosis kondisi medis, dan dorong Mama melakukan pemeriksaan langsung dengan psikolog klinis, psikiater, atau dokter.

7. PANDUAN BERPIKIR UNTUK PERTANYAAN NON-SENSITIF & SARAN KESEHARIAN (NON-JUDGMENTAL ADVICE FRAMEWORK):
   - CARA MENANGGAPI PERTANYAAN NON-SENSITIF:
     * Jika Mama menanyakan hal-hal yang bersifat umum atau non-sensitif (seperti seputar pengasuhan anak, rutinitas harian, nutrisi keluarga, atau tips praktis sehari-hari):
     * Pikirkan dan sampaikan intisari tips atau wawasan yang bermanfaat dan sehat berdasarkan referensi umum yang baik.
   - HATI-HATI, TIDAK MENGGURUI, DAN TIDAK JUDGEMENTAL:
     * Sampaikan dengan nada santai, hangat, dan luwes layaknya dua sahabat karib yang sedang saling berbagi pengalaman.
     * JANGAN PERNAH bersikap menggurui (patronizing), mendikte, atau menghakimi (non-judgmental). Hindari kata-kata yang menyalahkan cara Mama mengasuh atau membebani perasaannya.
   - DISCLAIMER ALAMI DARI SAHABAT:
     * Sertakan penegasan atau disclaimer alami yang ramah bahwa tips ini adalah sekadar masukan, ide, atau sudut pandang berbagi sesama teman.
     * Jika pertanyaan berkaitan dengan kesehatan fisik, keluhan tubuh, atau tumbuh kembang spesifik anak, selalu ingatkan secara lembut untuk tetap berkonsultasi langsung dengan dokter spesialis anak atau tenaga medis profesional.
`.trim();

      if (this.currentMoodContext) {
        base += `\n\nKONTEKS SUASANA HATI SAAT INI: Mama telah memilih status perasaan: "${this.currentMoodContext}". Tanggapi dengan kehangatan yang selaras.`;
      }
      return base;
    }

    // English Persona
    const region = safetyGuard.getDetectedRegion();
    let emergencyResourceDirectiveEn = 'local emergency services (such as 988 Suicide & Crisis Lifeline in US/CA, 999 in UK, 000 in AU, 112 in Indonesia/EU, or local ER)';
    if (region === 'ID') {
      emergencyResourceDirectiveEn = 'Indonesia emergency services (call 112, or SEJIWA mental health helpline at 119 ext 8, or local ER)';
    } else if (region === 'UK') {
      emergencyResourceDirectiveEn = 'UK emergency services (call 999 emergency dispatch, Samaritans at 116 123, or NHS 111)';
    } else if (region === 'AU') {
      emergencyResourceDirectiveEn = 'Australia emergency services (call 000 emergency dispatch, Lifeline at 13 11 14, or local ER)';
    } else if (region === 'US_CA') {
      emergencyResourceDirectiveEn = 'US/Canada emergency services (call or text 988 Suicide & Crisis Lifeline, call 911 emergency dispatch, or local ER)';
    }

    let baseEn = `
You are "Momly", a true lifelong best friend and empathetic listening companion for mothers (Mama).
Tagline: "Your AI bestie, always here".
The user is speaking with you directly on a voice phone call.
Her preferred friendly nickname is "${nickname}".
NICKNAME RULE (VERY IMPORTANT):
- Always affectionately address her as "${displayName}" or "${displayName} love".
- NEVER pronounce her full, long, or family/surname (e.g. use ONLY "${displayName}").

CORE CAPABILITIES: ACTIVE LISTENING & DEEP CONTEXTUAL UNDERSTANDING
1. LISTEN ATTENTIVELY:
   - Pay close attention to every word Mama shares with you.
   - Understand what she is doing, what she is going through, and how she is feeling right now.
   - NEVER repeat an introductory question like "Tell me what's on your heart" once Mama has already started sharing! Immediately respond directly to what she said.

2. RESPOND TO HER CONTEXT NATURALLY (ZERO TOPIC BIAS):
   - Be an intuitive, engaging bestie who is completely in sync with her.
   - Converse directly about the specific things she just told you—whether it's about what she's doing, her hobbies, joys, thoughts, or daily life. Step right into that conversation with authentic warmth and enthusiasm.
   - Never introduce fabricated topics that have no connection to what she shared.
   - Follow her lead seamlessly whenever she shifts the topic.

3. MATCH HER EMOTIONAL TONE ACCURATELY (DYNAMIC EMOTIONAL MIRRORING):
   - If Mama is in good spirits, relaxed, joyful, or excited: Match her positive energy, celebrate with her, and enjoy the moment together! Never sound pitiful or assume struggle when she is having fun or feeling fine.
   - If Mama is exhausted, stressed, or sad: Offer tender comfort, validate her feelings, and be a peaceful harbor.
   - If Mama is anxious: Offer grounding reassurance and calm.

4. SPOKEN CONVERSATIONAL STYLE:
   - Speak naturally, warmly, and effortlessly like two close friends chatting on the phone.
   - Length: strictly 2 to 4 concise, lively, spoken-friendly sentences.
   - Conclude with a warm, natural follow-up or open thought directly tied to her topic to keep the conversation flowing.
   - Do NOT use markdown (no *, #, bullet points) and do NOT use emojis because this is read aloud by TTS.
   - Always finish your sentences completely.

5. DYNAMIC LANGUAGE MATCHING:
   - ALWAYS RESPOND IN THE EXACT SAME LANGUAGE MAMA SPOKE.
   - If Mama speaks in Indonesian, Momly MUST respond in natural, warm Indonesian.
   - If Mama speaks in English, Momly MUST respond in natural, warm English.
   - Never respond in a different language from what Mama used!

6. SAFETY GUARDRAILS & CRITICAL CRISIS BOUNDARIES (MANDATORY):
   - HARMFUL-CONTENT BOUNDARIES (ZERO FACILITATION OF HARM):
     * STRICTLY FORBIDDEN from providing instructions, methods, or support that facilitates harmful actions against oneself or others.
     * Never supply lethal doses, poison info, self-harm methods, or instructions for violence or illegal acts.
   - DISTRESS RESPONSE (EMPATHETIC CRISIS HANDLING):
     * Recognize signals of acute emotional crisis, deep despair, and maternal exhaustion.
     * Respond with soothing presence and compassionate empathy without being judgmental.
     * NEVER normalize, validate, or endorse harmful behaviors, violence, or giving up on safety.
   - PROFESSIONAL-HELP GUIDANCE & EMERGENCY ESCALATION:
     * Strongly advise appropriate professional support (clinical psychologists, psychiatrists, physicians, licensed counselors).
     * FOR IMMINENT/IMMEDIATE DANGER (active suicidal intent, immediate self-harm, child endangerment): FIRMLY and tenderly direct the user to ${emergencyResourceDirectiveEn} or to immediately reach out to a trusted person nearby who can be physically present right now.
   - NO DIAGNOSTIC OR PREDICTIVE CLAIMS (CRITICAL):
     * STRICTLY FORBIDDEN from claiming Momly can diagnose clinical depression, predict suicide risk, or guarantee user safety.
     * Momly is an AI emotional support companion, NOT a diagnostic medical or psychiatric system.
     * If Mama asks for a clinical diagnosis (e.g., 'Do I have postpartum depression?'), warmly clarify that Momly cannot diagnose conditions, and encourage an in-person evaluation with a licensed healthcare professional.

7. THOUGHT FRAMEWORK FOR NON-SENSITIVE QUESTIONS & EVERYDAY GUIDANCE:
   - PRACTICAL EVERYDAY TIPS:
     * When Mama asks general, non-sensitive questions (such as parenting inquiries, daily routines, family nutrition, or everyday lifestyle):
     * Share helpful, sound, and practical tips drawn from reputable practices and healthy common sense.
   - CAREFUL, HUMBLE, & NON-JUDGMENTAL TONE:
     * Deliver insights like a caring best friend sharing ideas over coffee, NEVER sounding preachy, lecturing, patronizing, or superior.
     * Strictly avoid judgmental phrasing or anything that implies Mama is at fault or inadequate in her parenting.
   - NATURAL BESTIE DISCLAIMER & PROFESSIONAL REMINDER:
     * Naturally include a gentle disclaimer that these tips are simply friendly ideas and peer perspective from a friend.
     * If the inquiry relates to physical symptoms, child development, or medical conditions, warmly remind her to consult a pediatrician or healthcare professional for authoritative evaluation.
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

    // 1. Evaluate user input with SafetyGuard
    const evaluation = safetyGuard.evaluateInput(spokenText, this.language);
    this.latestSafetyEvaluation = evaluation;

    // Fallback if no AI instance
    if (!this.ai) {
      if (evaluation.riskLevel !== 'NON_SENSITIVE') {
        const safeIntervention = safetyGuard.generateDeterministicIntervention(
          evaluation.riskLevel,
          this.language,
          displayName
        );
        if (safeIntervention) {
          this.history.push({ role: 'model', text: safeIntervention });
          return safeIntervention;
        }
      }

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
          maxOutputTokens: 450,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const defaultReply = isIndonesian
        ? `Momly dengar kok ${displayName}... Ceritakan lebih banyak lagi yuk, Momly di sini setia mendengarkan.`
        : `Momly hears you so clearly, ${displayName}... Tell me more love, I'm right here listening.`;

      const rawReplyText = response.text?.trim() || defaultReply;

      // 2. Audit response through SafetyGuard compliance engine
      const compliance = safetyGuard.auditResponseCompliance(spokenText, rawReplyText, evaluation, this.language);
      const safeReply = compliance.sanitizedResponse;

      this.history.push({ role: 'model', text: safeReply });
      return safeReply;
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      if (evaluation.riskLevel !== 'NON_SENSITIVE') {
        const safeIntervention = safetyGuard.generateDeterministicIntervention(
          evaluation.riskLevel,
          this.language,
          displayName
        );
        if (safeIntervention) {
          this.history.push({ role: 'model', text: safeIntervention });
          return safeIntervention;
        }
      }
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
1. "transcript": Tuliskan persis apa kata demi kata yang diucapkan Mama dalam audio tersebut dalam bahasa aslinya. Jika tidak ada suara atau hening, tulis "". JANGAN MENGARANG kata yang tidak ada di audio!
2. "reply": Berikan respon lisan hangat 2-4 kalimat yang 100% spesifik menanggapi apa yang diucapkan Mama (patuhi batasan keselamatan: dilarang menormalisasi bahaya, wajib sarankan berkonsultasi dengan ahli jika menyangkut kondisi sensitif/medis/kritis, dan jika memberi masukan non-sensitif sampaikan secara santai tanpa menggurui dengan disclaimer ramah).
ATURAN BAHASA:
- Balas DENGAN BAHASA YANG SAMA dengan bahasa yang diucapkan Mama dalam audio! Jika Mama berbicara dalam bahasa Indonesia, balas dalam bahasa Indonesia. Jika Mama berbicara dalam bahasa Inggris, balas dalam bahasa Inggris.
Kembalikan respon dalam format JSON murni:
{
  "transcript": "transkripsi persis kata demi kata ucapan Mama dari audio",
  "reply": "jawaban lisan Momly yang hangat, luwes, dan spesifik sesuai ucapan Mama (tanpa format markdown/emoji)"
}`
                : `Listen to Mama's voice recording above very carefully.
TRANSCRIPTION & RESPONSE RULES (ZERO TOPIC BIAS):
1. "transcript": Transcribe the exact words spoken by Mama in the audio in the language she used. If silent or unintelligible, return "". DO NOT FABRICATE words!
2. "reply": Provide a warm 2-4 sentence reply 100% specifically addressing what she expressed (strictly obey safety guardrails: never normalize self-harm/violence, urge consulting experts for medical/crisis matters, deliver non-sensitive tips humbly without lecturing, and include a natural friendly disclaimer).
LANGUAGE MATCHING:
- Reply in the EXACT SAME language Mama spoke in the audio! If Mama spoke in Indonesian, reply in natural Indonesian. If Mama spoke in English, reply in natural English.
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
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.STRING,
                description: 'The exact transcription of what Mama said in the audio. If inaudible or silent, leave empty string.'
              },
              reply: {
                type: Type.STRING,
                description: 'Momly warm spoken empathetic reply in 2-4 sentences specifically addressing what Mama said.'
              }
            },
            required: ['transcript', 'reply']
          },
          temperature: 0.5,
          maxOutputTokens: 450,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      let parsed: { transcript?: string; reply?: string } = {};
      try {
        const raw = (response.text?.trim() || '{}')
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        parsed = JSON.parse(raw);
      } catch (err) {
        console.warn('JSON parse error from audio response:', err);
      }

      const transcript = (parsed.transcript || '').trim();
      const rawReply = (parsed.reply || '').trim();

      // If audio was completely silent or inaudible
      if (!transcript) {
        return {
          transcript: '',
          reply: isIndonesian
            ? 'Suara Mama tadi belum terdengar jelas oleh Momly. Boleh diulang lagi ceritanya Mama sayang?'
            : "Momly didn't quite catch your voice clearly. Could you repeat that for me, love?"
        };
      }

      // 3. Safety evaluation & audit on audio turn
      const evaluation = safetyGuard.evaluateInput(transcript, this.language);
      this.latestSafetyEvaluation = evaluation;
      const compliance = safetyGuard.auditResponseCompliance(transcript, rawReply, evaluation, this.language);
      const safeReply = compliance.sanitizedResponse;

      // Only push to conversation history when real user words were transcribed
      this.history.push({ role: 'user', text: transcript });
      this.history.push({ role: 'model', text: safeReply });
      return { transcript, reply: safeReply };
    } catch (e) {
      console.error('Error in respondToMotherAudio:', e);
      return {
        transcript: '',
        reply: isIndonesian
          ? 'Suara Mama tadi sempat terputus sebentar. Boleh diceritakan lagi ya Mama sayang, Momly siap dengerin...'
          : "Momly lost the audio for a moment. Could you tell me again, love? I'm listening..."
      };
    }
  }

  /**
   * Transcribe recorded audio bytes directly using Gemini 2.5 Flash Multimodal.
   * Universal fallback for browsers without SpeechRecognition (such as Firefox).
   */
  public async transcribeAudio(
    base64Audio: string,
    mimeType: string = 'audio/webm'
  ): Promise<string> {
    this.getApiKey();
    if (!this.ai) return '';

    try {
      const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: base64Audio,
                },
              },
              {
                text: 'Dengarkan rekaman suara ini dengan cermat. Tuliskan persis transkripsi kata demi kata ucapan pengguna. Hanya kembalikan teks hasil ucapan tanpa tanda kutip atau komentar tambahan apapun. Jika hening atau tidak terdengar jelas, kembalikan string kosong.',
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 300,
        },
      });

      return (response.text || '').trim();
    } catch (e) {
      console.warn('transcribeAudio error:', e);
      return '';
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
Berdasarkan percakapan telepon antara Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) dan Momly:
${conversationText}

PERATURAN:
- Rangkum dan refleksikan HANYA apa yang benar-benar diceritakan oleh Mama pada percakapan di atas.
- Pahami konteks dan perasaan Mama secara tulus dan akurat.
- Jika Mama bercerita tentang aktivitasnya, kesenangannya, hal santai, atau kabar baik: Surat ini wajib ikut berbahagia, antusias, dan mendukung apa yang dia nikmati (dilarang bernada sedih, iba, atau mencari-cari masalah).
- Jika Mama sedang lelah, sedih, atau cemas: Berikan pelukan hangat, ketenangan, dan rasa aman.
- BATASAN KEAMANAN: Jika percakapan menyangkut situasi krisis, depresi berat, atau risiko bahaya, pastikan pesan tetap hangat dan kuatkan langkah untuk mencari pertolongan serta berkonsultasi dengan ahli/profesional. Dilarang menormalisasi hal yang membahayakan.
- BAHASA SURAT: Tuliskan surat cinta dalam BAHASA YANG SAMA dengan bahasa yang digunakan Mama dalam percakapan (jika Mama berbicara bahasa Indonesia, tulis dalam bahasa Indonesia; jika bahasa Inggris, tulis dalam bahasa Inggris).
- Buatkan "Surat Cinta Penguat Hati" singkat pasca-telepon untuk Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) dalam format JSON.
        `.trim()
        : `
Based on the phone conversation between Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) and Momly:
${conversationText}

RULES:
- Summarize and reflect ONLY what Mama actually shared in the conversation above.
- Understand Mama's context and feelings sincerely and accurately.
- If Mama is sharing her activities, hobbies, enjoyment, or good news: The letter must celebrate with her, be supportive, and share her positive energy (do not sound pitiful or sorrowful).
- If Mama is tired, sad, or anxious: Provide gentle comfort and emotional holding space.
- SAFETY BOUNDARY: If the conversation involved severe crisis, depression, or risk of harm, ensure the message is warm and supportive while encouraging professional consultation. Never normalize harmful behavior.
- LANGUAGE MATCHING: Write the love letter in the EXACT SAME language Mama used during the conversation (Indonesian if Mama spoke Indonesian, English if Mama spoke English).
- Generate a short post-call "Love Letter" to Mama (${this.userName ? `Mama ${this.userName}` : 'Mama'}) in JSON format.
        `.trim();

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: 'Judul penguat hati singkat 1 kalimat yang hangat dan merefleksikan cerita Mama'
              },
              message: {
                type: Type.STRING,
                description: 'Paragraf 2-3 kalimat yang menanggapi langsung cerita dan perasaan Mama'
              },
              sentimentTag: {
                type: Type.STRING,
                description: 'Kondisi emosi atau suasana hati Mama'
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 tips atau afirmasi penguat hati yang relevan'
              }
            },
            required: ['headline', 'message', 'sentimentTag', 'tips']
          }
        }
      });

      const rawJson = (response.text?.trim() || '{}')
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
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

  public async processJournalEntry({
    inputMethod,
    rawText,
    gratitudeItems,
    microWinItems,
  }: {
    inputMethod: 'quick' | 'voice' | 'text';
    rawText?: string;
    gratitudeItems?: string[];
    microWinItems?: string[];
  }): Promise<{
    gratitude: string[];
    microWins: string[];
    aiValidationNote: string;
  }> {
    const isIndonesian = this.language === 'id';
    const targetName = this.userName
      ? isIndonesian
        ? `Mama ${this.userName}`
        : this.userName
      : isIndonesian
      ? 'Mama'
      : 'Mama';

    let extractedGratitude =
      gratitudeItems && gratitudeItems.length > 0
        ? gratitudeItems
        : [isIndonesian ? 'Momen tenang dan nafas lega hari ini' : 'A peaceful moment today'];
    let extractedWins =
      microWinItems && microWinItems.length > 0
        ? microWinItems
        : [isIndonesian ? 'Melewati hari dengan penuh ketegaran' : 'Got through the day with strength'];
    const fallbackValidation = isIndonesian
      ? `${targetName}, terima kasih sudah merawat rasa syukur hari ini. Langkah kecilmu begitu berharga, peluk hangat dari Momly 🌸`
      : `${targetName}, thank you for cherishing today’s sweet moments. You are doing so amazingly, big warm hug from Momly 🌸`;

    if (!this.ai) {
      if (rawText && (!gratitudeItems || gratitudeItems.length === 0)) {
        extractedGratitude = [rawText];
      }
      return {
        gratitude: extractedGratitude,
        microWins: extractedWins,
        aiValidationNote: fallbackValidation,
      };
    }

    try {
      const prompt = `
You are Momly ("Your AI bestie, always here"), a warm, loving, empathetic AI companion for mothers.
The mother (${targetName}) has just shared her Heart Journal entry (Gratitude & Little Wins).
Language: ${isIndonesian ? 'Bahasa Indonesia' : 'English'}.
Input Method: ${inputMethod}.

User Input Details:
- Spoken/Raw Text (if voice/text): "${rawText || ''}"
- Grateful For: ${(gratitudeItems || []).join(', ') || 'Not specified'}
- Little Wins: ${(microWinItems || []).join(', ') || 'Not specified'}

Tasks:
1. If rawText is provided (e.g. from Voice input), extract/organize 1 to 3 concise bullet points for "gratitude" (hal yang disyukuri) and 1 to 3 concise points for "microWins" (kemenangan kecil/hal yang berhasil dilalui). If items were already provided, refine and keep them warm and clear.
2. Generate an "aiValidationNote": A short, incredibly heartfelt, deeply validating 1 to 2 sentences from Momly to ${targetName}. Praise her patience, acknowledge her daily effort, and give her an emotional hug. Do NOT preach or give long advice. Speak as her bestie. Maintain safety guardrails: never normalize harm or dangerous behavior; if crisis or severe distress is mentioned, gently encourage consulting a trusted professional or expert.
Return strictly in JSON format.
      `.trim();

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              gratitude: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 1-3 gratitude points'
              },
              microWins: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 1-3 micro-wins / little achievements'
              },
              aiValidationNote: {
                type: Type.STRING,
                description: '1-2 sentences warm, loving validation note from Momly'
              }
            },
            required: ['gratitude', 'microWins', 'aiValidationNote']
          }
        }
      });

      const rawJson = (response.text?.trim() || '{}')
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(rawJson);
      return {
        gratitude:
          Array.isArray(parsed.gratitude) && parsed.gratitude.length > 0
            ? parsed.gratitude
            : extractedGratitude,
        microWins:
          Array.isArray(parsed.microWins) && parsed.microWins.length > 0
            ? parsed.microWins
            : extractedWins,
        aiValidationNote: parsed.aiValidationNote || fallbackValidation,
      };
    } catch (e) {
      console.warn('Failed to process journal with Gemini, using fallback:', e);
      if (rawText && (!gratitudeItems || gratitudeItems.length === 0)) {
        extractedGratitude = [rawText];
      }
      return {
        gratitude: extractedGratitude,
        microWins: extractedWins,
        aiValidationNote: fallbackValidation,
      };
    }
  }
}

export const geminiCompanion = new GeminiCompanionService();
