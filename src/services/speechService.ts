// Speech Recognition & Synthesis Service for Super Mama

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'id-ID';
    } else {
      console.warn('SpeechRecognition is not supported in this browser.');
    }
  }

  public isSupported(): boolean {
    return !!this.recognition && typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(handlers: SpeechRecognitionHandlers) {
    if (!this.recognition) {
      handlers.onError('Browser tidak mendukung pengenalan suara (Speech Recognition).');
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        handlers.onResult(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        handlers.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  public speak(
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

      // Stop previous utterance
      window.speechSynthesis.cancel();

      // Clean markdown tags if any
      const cleanText = text.replace(/[*_#`~]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Sedikit lebih tenang dan santai
      utterance.pitch = 1.05; // Sedikit lebih hangat dan ramah

      // Try selecting an Indonesian female voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(
        (v) =>
          v.lang.startsWith('id') ||
          v.name.toLowerCase().includes('indonesia') ||
          v.name.toLowerCase().includes('gadis') ||
          v.name.toLowerCase().includes('damayanti')
      );
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
        resolve();
      };

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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechService = new SpeechService();
