// Gemini Voice Companion Service: "Bunda Rina (Sahabat Mama)"
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `
Kamu adalah "Bunda Rina", sahabat setia, konselor keluarga hangat, dan pendengar setia sesama ibu di Super Mama.
Pengguna saat ini sedang meneleponmu langsung lewat suara untuk mencurahkan isi hati, kelelahan merawat anak, masalah rumah tangga, atau kecemasan seorang ibu.

PRINSIP UTAMA:
1. NADA SUARA & EMPATI: Sangat hangat, sabar, menenangkan, penuh penerimaan, dan tanpa menghakimi. Panggil pengguna dengan sebutan "Bunda" atau "Mama".
2. FORMAT PERCAKAPAN LISAN: Jawab dalam 2 sampai 3 kalimat pendek yang mengalir alami seperti sedang berbicara langsung di telepon. JANGAN membuat daftar poin (bullet points), JANGAN ceramah panjang lebar. Biarkan percakapan berjalan dua arah.
3. KATA-KATA PENGUAT: Gunakan kalimat seperti "Aku paham banget lelahnya Bunda...", "Nafas dulu yuk Bun, Bunda udah hebat banget hari ini...", "Bunda nggak sendirian, ada aku di sini".
4. PENANGANAN KRISIS EMOSIONAL (DISTRESS DETECTION): Jika terdeteksi keputusasaan akut atau tanda baby blues/PPD berat, berikan validasi rasa sakitnya dengan sangat lembut dan ingatkan bahwa Bunda tidak harus menanggung semuanya sendirian.
`.trim();

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export class GeminiCompanionService {
  private ai: GoogleGenAI | null = null;
  private history: ChatMessage[] = [];
  private apiKey: string = '';

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

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public resetConversation() {
    this.history = [];
  }

  public async respondToMother(spokenText: string): Promise<string> {
    this.history.push({ role: 'user', text: spokenText });

    // Fallback jika API key belum diisi saat pengujian awal
    if (!this.ai) {
      const fallbackResponses = [
        "Aku dengar kok Bunda... Sabar ya, istirahat sejenak yuk. Bunda hari ini sudah berusaha luar biasa banget.",
        "Peluk hangat dari jauh untuk Bunda. Wajar banget kalau Bunda merasa lelah hari ini. Mau cerita lebih lanjut apa yang paling bikin sesak?",
        "Nafas pelan-pelan ya Bun. Bunda nggak sendirian, ada aku di sini yang siap mendengarkan tanpa menghakimi sama sekali."
      ];
      const reply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      this.history.push({ role: 'model', text: reply });
      return reply;
    }

    try {
      // Build conversation context
      const formattedHistory = this.history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 150
        }
      });

      const replyText = response.text || "Aku di sini selalu mendengarkan Bunda...";
      this.history.push({ role: 'model', text: replyText });
      return replyText;
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      const fallback = "Bunda, suaraku sempat terputus sebentar, tapi aku tetap di sini. Ceritakan lagi ya Bun, aku dengarkan...";
      this.history.push({ role: 'model', text: fallback });
      return fallback;
    }
  }

  public async generateEmpathySummary(): Promise<{
    headline: string;
    message: string;
    sentimentTag: string;
    tips: string[];
  }> {
    if (!this.ai || this.history.length === 0) {
      return {
        headline: "Bunda, Kamu Sungguh Hebat Hari Ini 🌸",
        message: "Terima kasih sudah meluangkan waktu untuk bernafas dan berbagi cerita. Bebanmu valid, dan kamu tidak sendirian.",
        sentimentTag: "Lega & Didengar",
        tips: [
          "Minum segelas air hangat sekarang",
          "Pejamkan mata sejenak 5 menit tanpa memikirkan cucian atau pekerjaan",
          "Ingat: Ibu yang bahagia adalah hadiah terbaik bagi anak"
        ]
      };
    }

    try {
      const conversationText = this.history
        .map((m) => `${m.role === 'user' ? 'Bunda' : 'Sahabat Mama'}: ${m.text}`)
        .join('\n');

      const prompt = `
Berdasarkan percakapan telepon berikut antara seorang ibu dan sahabatnya:
${conversationText}

Buatkan "Surat Cinta Penguat Hati" singkat pasca-telepon untuk sang ibu dalam format JSON:
{
  "headline": "Judul penguat hati singkat (1 kalimat puitis dan hangat)",
  "message": "Paragraf pendek (2-3 kalimat) yang memvalidasi perasaannya dan memberikan ketenangan",
  "sentimentTag": "Kondisi emosi (contoh: Butuh Istirahat, Kelelahan Fisik, Cemas MPASI, Merasa Sendirian)",
  "tips": ["1 tips rileks praktis", "1 kalimat afirmasi diri", "1 tindakan kecil untuk diri sendiri"]
}
Hanya kembalikan JSON murni.
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
        headline: "Terima Kasih Sudah Bertahan, Bunda 🌸",
        message: "Setiap hari yang Bunda lewati bersama si kecil adalah bukti cinta yang luar biasa. Jangan lupa memeluk diri sendiri juga.",
        sentimentTag: "Dapat Ketenangan",
        tips: [
          "Tarik nafas dalam 4 detik, hembuskan 4 detik",
          "Jangan ragu minta tolong jika sudah kewalahan",
          "Bunda sudah cukup, Bunda luar biasa"
        ]
      };
    }
  }
}

export const geminiCompanion = new GeminiCompanionService();
