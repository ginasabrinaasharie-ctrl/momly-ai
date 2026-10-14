// Enhanced Speech Recognition & Neural Synthesis Service for Momly
import { Language } from './i18n.ts';

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal?: boolean) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentLang: Language = 'en';

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Pre-load browser voices
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public setLanguage(lang: Language) {
    this.currentLang = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';
    }
  }

  public getLanguage(): Language {
    return this.currentLang;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLang === 'id' ? 'id-ID' : 'en-US';
    } else {
      console.warn('SpeechRecognition is not supported in this browser.');
    }
  }

  public isSupported(): boolean {
    return !!this.recognition && typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  public async requestMicrophonePermission(): Promise<{ ok: boolean; error?: string }> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { ok: false, error: 'Browser ini tidak mendukung akses mikrofon.' };
    }

    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;

      await this.ensureAudioContextRunning();

      return { ok: true };
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      let msg = 'Izin mikrofon belum aktif.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin mikrofon belum aktif. Mohon klik ikon gembok / kamera di baris URL browser dan pilih "Allow" / "Izinkan" untuk Mikrofon.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Tidak ada perangkat mikrofon yang terdeteksi pada komputermu.';
      }
      return { ok: false, error: msg };
    }
  }

  public async ensureAudioContextRunning(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext && AudioContextClass && this.mediaStream) {
        this.audioContext = new AudioContextClass();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (e) {
      console.warn('ensureAudioContextRunning notice:', e);
    }
  }

  public async resumeAudioContext(): Promise<void> {
    await this.ensureAudioContextRunning();
  }

  public getAudioVolume(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let max = 0;
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > max) max = dataArray[i];
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    return Math.round((max * 0.7) + (avg * 0.3));
  }

  private getSupportedAudioMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return '';
  }

  public async startAudioRecording() {
    if (!this.mediaStream || !this.mediaStream.active) {
      await this.requestMicrophonePermission();
    }
    if (!this.mediaStream) return;

    // Cleanly detach and stop any existing recorder so its chunks NEVER leak
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.ondataavailable = null;
        this.mediaRecorder.onstop = null;
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (e) {}
      this.mediaRecorder = null;
    }

    // Always reset recordedChunks to a brand new empty array for the new turn
    this.recordedChunks = [];

    try {
      const mimeType = this.getSupportedAudioMimeType();
      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(200);
    } catch (e) {
      console.warn('MediaRecorder start error:', e);
    }
  }

  public async stopAudioRecording(): Promise<{ base64: string; mimeType: string } | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.recordedChunks = [];
      return null;
    }

    return new Promise((resolve) => {
      const rec = this.mediaRecorder!;
      const onStop = () => {
        const rawMime = rec.mimeType || 'audio/webm';
        const mimeType = rawMime.split(';')[0].trim();
        // Grab current chunks and immediately empty recordedChunks so nothing leaks to next turn!
        const currentChunks = [...this.recordedChunks];
        this.recordedChunks = [];

        const blob = new Blob(currentChunks, { type: rawMime });
        if (blob.size < 300) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || '';
          resolve({ base64, mimeType });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      };

      rec.addEventListener('stop', onStop, { once: true });
      try {
        rec.stop();
      } catch (e) {
        this.recordedChunks = [];
        resolve(null);
      }
    });
  }

  public stopMicrophoneStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }

  public startListening(handlers: SpeechRecognitionHandlers) {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handlers.onError('Browser tidak mendukung Speech Recognition.');
      return;
    }

    // Always cleanly reset previous instance to prevent InvalidStateError in Chrome/Edge
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLang === 'id' ? 'id-ID' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let accumulated = '';
        let isFinal = false;
        for (let i = 0; i < event.results.length; ++i) {
          accumulated += event.results[i][0].transcript + ' ';
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        const clean = accumulated.trim();
        if (clean) {
          handlers.onResult(clean, isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          handlers.onError('Izin mic ditolak di browser. Klik ikon gembok di URL bar untuk mengizinkan mic.');
        } else if (event.error === 'network') {
          handlers.onError('Koneksi speech server browser terhambat. Mama bisa gunakan kolom ketik pesan di bawah.');
        } else if (event.error === 'audio-capture') {
          handlers.onError('Perangkat mikrofon tidak terdeteksi.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          handlers.onError(`Mic notice: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart cleanly if we are still supposed to be listening
          setTimeout(() => {
            if (this.isListening) {
              try {
                this.startListening(handlers);
              } catch (e) {}
            }
          }, 200);
        } else {
          handlers.onEnd?.();
        }
      };

      this.isListening = true;
      this.recognition.start();
    } catch (e: any) {
      console.warn('Failed to start speech recognition:', e);
      handlers.onError('Gagal mengaktifkan mikrofon');
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  /**
   * Synthesize speech using Google Cloud Neural TTS REST API if key is available,
   * falling back to the browser's best neural voices (Microsoft Gadis Natural / Jenny Natural).
   */
  public async speak(
    text: string,
    apiKey?: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    // Clean text of markdown characters and emojis so TTS doesn't vocalize emoji symbols
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
      .trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    // 1. Try Gemini 3.8 Flash TTS with voice "Tova" (temperature 1.25)
    if (apiKey) {
      try {
        const played = await this.speakWithGeminiTTS(cleanText, apiKey, onStart, onEnd);
        if (played) return;
      } catch (err) {
        console.warn('Gemini 3.8 Flash TTS error, falling back:', err);
      }
    }

    // 2. Fallback: Web Speech API with tuned natural parameters
    await this.speakWithBrowserWebSpeech(cleanText, onStart, onEnd);
  }

  /**
   * Gemini 3.8 Flash TTS with voice "Tova" (Resonant and soothing, Medium-low pitch) and temperature 1.25
   */
  private speakWithGeminiTTS(
    text: string,
    apiKey: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text }]
                }
              ],
              generationConfig: {
                temperature: 1.25,
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: 'Tova'
                    }
                  }
                }
              }
            }),
          }
        );

        if (!response.ok) {
          resolve(false);
          return;
        }

        const data = await response.json();
        const candidatePart = data.candidates?.[0]?.content?.parts?.[0];
        const audioData = candidatePart?.inlineData;

        if (!audioData || !audioData.data) {
          resolve(false);
          return;
        }

        const mime = audioData.mimeType || 'audio/wav';
        const audio = new Audio(`data:${mime};base64,${audioData.data}`);
        this.currentAudio = audio;

        let hasEnded = false;
        const triggerEnd = () => {
          if (hasEnded) return;
          hasEnded = true;
          this.isSpeaking = false;
          this.currentAudio = null;
          onEnd?.();
          resolve(true);
        };

        audio.onplay = () => {
          this.isSpeaking = true;
          onStart?.();
        };

        audio.onended = () => {
          triggerEnd();
        };

        audio.onerror = () => {
          triggerEnd();
        };

        // Safety watchdog: ensure onEnd triggers even if browser stalls
        const estimatedSeconds = Math.max(4, Math.ceil(text.length / 12)) + 3;
        const watchdog = setTimeout(() => {
          if (!hasEnded) {
            triggerEnd();
          }
        }, estimatedSeconds * 1000);

        try {
          await audio.play();
        } catch (playErr) {
          clearTimeout(watchdog);
          triggerEnd();
        }
      } catch (err) {
        resolve(false);
      }
    });
  }

  private speakWithBrowserWebSpeech(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const isIndonesian = this.currentLang === 'id';

      utterance.lang = isIndonesian ? 'id-ID' : 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();

      if (isIndonesian) {
        const preferredIdVoice =
          voices.find((v) => v.name.includes('Gadis') && v.name.includes('Natural')) ||
          voices.find((v) => v.name.includes('Gadis')) ||
          voices.find((v) => v.name.toLowerCase().includes('indonesia') && v.lang.startsWith('id')) ||
          voices.find((v) => v.lang.startsWith('id'));
        if (preferredIdVoice) utterance.voice = preferredIdVoice;
      } else {
        const preferredEnVoice =
          voices.find((v) => v.name.includes('Jenny') && v.name.includes('Natural')) ||
          voices.find((v) => v.name.includes('Ava') && v.name.includes('Natural')) ||
          voices.find((v) => v.name.includes('Emma') && v.name.includes('Natural')) ||
          voices.find((v) => v.name.includes('Samantha')) ||
          voices.find((v) => v.name.includes('Google US English')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferredEnVoice) utterance.voice = preferredEnVoice;
      }

      let hasEnded = false;
      const triggerEnd = () => {
        if (hasEnded) return;
        hasEnded = true;
        this.isSpeaking = false;
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        onStart?.();
      };

      utterance.onend = () => {
        triggerEnd();
      };

      utterance.onerror = () => {
        triggerEnd();
      };

      // Watchdog for WebSpeech API in Chrome
      const estimatedSeconds = Math.max(3, Math.ceil(text.length / 10)) + 3;
      setTimeout(() => {
        if (!hasEnded) {
          window.speechSynthesis.cancel();
          triggerEnd();
        }
      }, estimatedSeconds * 1000);

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio = null;
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();
