import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, MessageSquareHeart, Send, ShieldAlert, PhoneCall, ExternalLink } from 'lucide-react';
import { speechService } from '../services/speechService.ts';
import { geminiCompanion } from '../services/geminiVoiceCompanion.ts';
import { usageGuard } from '../services/usageGuard.ts';
import type { SafetyEvaluation } from '../services/safetyGuard.ts';
import { MomlyAvatar, MomlyPose } from './MomlyAvatar.tsx';
import { MoodOption } from './MoodCheckIn.tsx';
import { Language, translations } from '../services/i18n.ts';

interface CallScreenProps {
  onEndCall: () => void;
  lang: Language;
  selectedMood?: MoodOption | null;
}

export const CallScreen: React.FC<CallScreenProps> = ({ onEndCall, lang, selectedMood }) => {
  const t = translations[lang].callScreen;
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'listening' | 'thinking' | 'speaking'>('connecting');
  const [latestUserText, setLatestUserText] = useState('');
  const [latestModelText, setLatestModelText] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [micNotice, setMicNotice] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [safetyAlert, setSafetyAlert] = useState<SafetyEvaluation | null>(null);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTextRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll audio level when listening
  useEffect(() => {
    const meterInterval = setInterval(() => {
      if (callStatus === 'listening' && !isMuted) {
        setAudioLevel(speechService.getAudioVolume());
      } else {
        setAudioLevel(0);
      }
    }, 100);
    return () => clearInterval(meterInterval);
  }, [callStatus, isMuted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Ensure AudioContext is unlocked on any user gesture
  useEffect(() => {
    const unlockAudio = () => {
      speechService.ensureAudioContextRunning();
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Start speech listening loop
  const startListeningLoop = async () => {
    if (isMuted || isProcessingRef.current) return;

    setCallStatus('listening');
    await speechService.ensureAudioContextRunning();
    speechService.startAudioRecording();

    speechService.startListening({
      onResult: (text: string, isFinal?: boolean) => {
        if (isProcessingRef.current) return;
        speechTextRef.current = text;
        setLatestUserText(text);

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        const clean = text.trim();
        if (!clean) return;

        // Cek apakah kalimat sudah diakhiri tanda titik, tanda tanya, atau tanda seru
        const endsWithPunctuation = /[.?!]$/.test(clean);

        // Natural turn-taking timing:
        // - Titik / tanda tanya: 1.5s
        // - isFinal (selesai frasa): 2.5s
        // - Jeda umum: 3.5s
        const timeoutMs = endsWithPunctuation ? 1500 : isFinal ? 2500 : 3500;

        silenceTimerRef.current = setTimeout(() => {
          handleUserFinishedSpeaking(speechTextRef.current);
        }, timeoutMs);
      },
      onError: (err: string) => {
        console.warn('Speech err:', err);
      },
      onEnd: () => {
        // Do not force-submit on interim onEnd, let silence timer or manual button control turn-taking
      },
    });
  };

  const handleInterruptMomly = () => {
    speechService.stopSpeaking();
    speechService.stopAudioRecording();
    speechTextRef.current = '';
    setLatestUserText('');
    isProcessingRef.current = false;
    startListeningLoop();
  };

  const handleUserFinishedSpeaking = async (manualText?: string) => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    speechService.stopListening();
    const audioData = await speechService.stopAudioRecording();

    let textToSend = (manualText !== undefined ? manualText : speechTextRef.current).trim();
    if (!textToSend) {
      textToSend = latestUserText.trim();
    }
    if (!textToSend && textInput.trim()) {
      textToSend = textInput.trim();
    }

    // Check Rate Limiting & Safe Quota before making AI call
    if (textToSend || (audioData && audioData.base64 && audioData.base64.length > 200)) {
      const quota = usageGuard.consumeTurn();
      if (!quota.allowed) {
        setCallStatus('speaking');
        const quotaNotice = lang === 'id'
          ? 'Mama dan Juri yang baik, kuota sesi demo hari ini telah tercapai untuk menjaga kestabilan sistem. Terima kasih banyak telah mengevaluasi Momly di AI Builder Cup 2026!'
          : 'Dear Mama and Judge, the safe session quota for today has been reached to protect system stability. Thank you so much for testing Momly for the AI Builder Cup 2026!';
        setLatestModelText(quotaNotice);
        if (isSpeakerOn) {
          await speechService.speak(
            quotaNotice,
            geminiCompanion.getApiKey(),
            () => setCallStatus('speaking'),
            () => {
              isProcessingRef.current = false;
            }
          );
        } else {
          isProcessingRef.current = false;
        }
        return;
      }
    }

    // CASE 1: Transcribed text or typed text is available
    if (textToSend) {
      setMicNotice('');
      setTextInput('');
      setCallStatus('thinking');

      try {
        const response = await geminiCompanion.respondToMother(textToSend);
        setLatestModelText(response);

        // Check if turn flagged crisis/safety alert
        const evalResult = geminiCompanion.getLatestSafetyEvaluation();
        if (evalResult && (evalResult.requiresEmergencyEscalation || evalResult.requiresProfessionalReferral)) {
          setSafetyAlert(evalResult);
        }

        if (isSpeakerOn) {
          await speechService.speak(
            response,
            geminiCompanion.getApiKey(),
            () => setCallStatus('speaking'),
            () => {
              speechTextRef.current = '';
              setLatestUserText('');
              isProcessingRef.current = false;
              startListeningLoop();
            }
          );
        } else {
          speechTextRef.current = '';
          setLatestUserText('');
          isProcessingRef.current = false;
          startListeningLoop();
        }
      } catch (e) {
        console.error('Error in conversation turn:', e);
        speechTextRef.current = '';
        setLatestUserText('');
        isProcessingRef.current = false;
        startListeningLoop();
      }
      return;
    }

    // CASE 2: Web Speech API missed words, but MediaRecorder captured physical audio bytes!
    // Send audio directly to Gemini 2.5 Flash Multimodal
    if (audioData && audioData.base64 && audioData.base64.length > 200) {
      setMicNotice('');
      setTextInput('');
      setCallStatus('thinking');

      try {
        const { transcript, reply } = await geminiCompanion.respondToMotherAudio(
          audioData.base64,
          audioData.mimeType
        );

        if (transcript) {
          speechTextRef.current = transcript;
          setLatestUserText(transcript);
        } else {
          setMicNotice(
            lang === 'id'
              ? '🎙️ Suara belum tertangkap jelas. Yuk coba bicara lebih dekat...'
              : "🎙️ Mic didn't catch your voice clearly. Please try speaking closer..."
          );
          setTimeout(() => setMicNotice(''), 4500);
        }
        setLatestModelText(reply);

        // Check if audio turn flagged crisis/safety alert
        const evalAudioResult = geminiCompanion.getLatestSafetyEvaluation();
        if (evalAudioResult && (evalAudioResult.requiresEmergencyEscalation || evalAudioResult.requiresProfessionalReferral)) {
          setSafetyAlert(evalAudioResult);
        }

        if (isSpeakerOn) {
          await speechService.speak(
            reply,
            geminiCompanion.getApiKey(),
            () => setCallStatus('speaking'),
            () => {
              speechTextRef.current = '';
              setLatestUserText('');
              isProcessingRef.current = false;
              startListeningLoop();
            }
          );
        } else {
          speechTextRef.current = '';
          setLatestUserText('');
          isProcessingRef.current = false;
          startListeningLoop();
        }
      } catch (e) {
        console.error('Error in audio conversation turn:', e);
        speechTextRef.current = '';
        setLatestUserText('');
        isProcessingRef.current = false;
        startListeningLoop();
      }
      return;
    }

    // CASE 3: No speech text and no recorded audio (mic was completely quiet)
    isProcessingRef.current = false;
    setMicNotice(
      lang === 'id'
        ? '🎙️ Suara belum tertangkap mic. Yuk bicara lebih dekat atau ketik di bawah ya...'
        : "🎙️ Mic didn't catch your voice. Please speak closer or type below..."
    );
    setTimeout(() => setMicNotice(''), 4500);
    startListeningLoop();
  };

  // Initial greeting when call connects
  useEffect(() => {
    let isCancelled = false;

    speechService.setLanguage(lang);
    geminiCompanion.setLanguage(lang);

    const initiateCall = async () => {
      setCallStatus('connecting');

      // Proactively request browser microphone permission
      const micPerm = await speechService.requestMicrophonePermission();
      if (!micPerm.ok && !isCancelled) {
        setMicNotice(micPerm.error || 'Izin mikrofon belum aktif.');
      }

      const greeting = await geminiCompanion.getInitialGreeting();
      if (isCancelled) return;

      setLatestModelText(greeting);

      speechService.speak(
        greeting,
        geminiCompanion.getApiKey(),
        () => {
          if (!isCancelled) setCallStatus('speaking');
        },
        () => {
          if (!isCancelled) {
            startListeningLoop();
          }
        }
      );
    };

    initiateCall();

    return () => {
      isCancelled = true;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      speechService.stopListening();
      speechService.stopSpeaking();
      speechService.stopMicrophoneStream();
    };
  }, [lang]);

  const toggleMute = () => {
    if (!isMuted) {
      speechService.stopListening();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      startListeningLoop();
    }
  };

  const toggleSpeaker = () => {
    if (isSpeakerOn) {
      speechService.stopSpeaking();
      setIsSpeakerOn(false);
    } else {
      setIsSpeakerOn(true);
    }
  };

  // Helper to dynamically select sympathetic or supportive avatar pose
  const getAvatarPose = (): MomlyPose => {
    const sadMoodIds = ['exhausted', 'anxious', 'crying', 'numb'];
    const hasSadMood = selectedMood?.id && sadMoodIds.includes(selectedMood.id);

    const fullConversationText = `${speechTextRef.current} ${latestUserText} ${latestModelText}`.toLowerCase();
    const distressWords = [
      'sedih', 'nangis', 'lelah', 'capek', 'sakit', 'pusing', 'demam', 'stres', 'stress', 'hampa',
      'berat', 'bingung', 'takut', 'cemas', 'kecewa', 'drop', 'kewalahan', 'burnout',
      'overwhelmed', 'sad', 'crying', 'cry', 'tired', 'exhausted', 'sick', 'pain', 'hurts',
      'anxious', 'panic', 'grief', 'lonely', 'hopeless', 'heavy', 'drained', 'numb', 'down'
    ];
    const isVulnerable = !!hasSadMood || distressWords.some((word) => fullConversationText.includes(word));

    if (callStatus === 'connecting') {
      return isVulnerable ? 'welcoming' : 'bestie';
    }

    if (callStatus === 'thinking') {
      return 'understanding';
    }

    if (callStatus === 'listening') {
      return isVulnerable ? 'understanding' : 'listening';
    }

    // When Momly is speaking:
    if (callStatus === 'speaking') {
      // If user is sad/exhausted/sick, Momly displays a sympathetic compassionate face ('understanding')
      // instead of cheerful laughing/clasping ('supportive')
      if (isVulnerable) {
        return 'understanding';
      }
      return 'supportive';
    }

    return 'bestie';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#1C1228] via-[#2D2040] to-[#1C1228] text-white p-5 sm:p-8 select-none max-w-md mx-auto sm:rounded-[36px] overflow-hidden shadow-2xl">
      {/* Top Header: Logo, Name & Duration */}
      <div className="flex flex-col items-center pt-6 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07B6B]/15 border border-[#F07B6B]/30 text-[#F5A898] text-[11px] font-medium">
          <Sparkles className="w-3 h-3 text-[#F07B6B] animate-spin" />
          <span>
            {usageGuard.getCurrentUser()?.role === 'judge'
              ? (lang === 'id' ? 'Judges Mode • Kuota Aman Aktif' : 'Judges Mode • Quota Guard Active')
              : t.substatus}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
          Mom<span className="text-[#F07B6B]">ly</span>
        </h2>
        <span className="text-xl font-mono text-emerald-400 tracking-wider">
          {formatTime(duration)}
        </span>
      </div>

      {/* Center: Momly Avatar & Call State */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Waves */}
          {callStatus === 'connecting' && (
            <div className="absolute w-44 h-44 rounded-full bg-rose-400/20 animate-pulse pointer-events-none" />
          )}

          {callStatus === 'speaking' && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-[#F07B6B]/20 animate-pulse-ring" />
              <div className="absolute w-64 h-64 rounded-full bg-[#F5A898]/10 animate-pulse-ring delay-300" />
            </>
          )}

          {callStatus === 'listening' && (
            <>
              <div
                className={`absolute rounded-full transition-all duration-150 pointer-events-none ${
                  audioLevel > 5 || latestUserText
                    ? 'w-56 h-56 bg-emerald-400/30 ring-4 ring-emerald-300/60 animate-pulse'
                    : 'w-44 h-44 bg-emerald-500/15'
                }`}
              />
              {(audioLevel > 15 || latestUserText) && (
                <div className="absolute w-64 h-64 rounded-full bg-teal-400/25 animate-ping pointer-events-none" />
              )}
            </>
          )}

          {/* Momly Illustrated Avatar */}
          <div
            className={`relative p-1 rounded-full transition-all duration-200 ${
              callStatus === 'listening' && (audioLevel > 5 || latestUserText)
                ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-[#F07B6B] shadow-2xl shadow-emerald-400/60 ring-4 ring-emerald-300/80 scale-105'
                : 'bg-gradient-to-tr from-[#F07B6B] via-[#F5A898] to-[#9B8EC4] shadow-2xl shadow-[#F07B6B]/30'
            }`}
          >
            <MomlyAvatar
              size="xl"
              pose={getAvatarPose()}
              isSpeaking={callStatus === 'speaking'}
              isListening={callStatus === 'listening'}
            />
          </div>
        </div>

        {/* State Label */}
        <div className="text-center space-y-2 max-w-xs px-2">
          {callStatus === 'connecting' && (
            <div className="flex items-center justify-center gap-2 text-rose-300 font-medium animate-pulse text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>{t.connecting}</span>
            </div>
          )}

          {callStatus === 'listening' && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${audioLevel > 4 || latestUserText ? 'bg-emerald-400 animate-ping shadow-lg shadow-emerald-400' : 'bg-emerald-500'}`} />
                <span className={audioLevel > 4 || latestUserText ? 'text-emerald-300' : 'text-emerald-200/90'}>
                  {audioLevel > 4 || latestUserText
                    ? (lang === 'id' ? '🎙️ Suara Mama Terdengar...' : '🎙️ Hearing Mama speak...')
                    : t.listening}
                </span>
              </div>
              {/* Dynamic VU Meter bars responding to physical mic volume */}
              <div className="flex items-center gap-1 h-6 justify-center px-3 py-0.5 rounded-full bg-black/20 backdrop-blur-xs">
                <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(22, (audioLevel + (latestUserText ? 10 : 0)) * 1.2))}px` }} />
                <span className="w-1 bg-emerald-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(26, (audioLevel + (latestUserText ? 12 : 0)) * 1.5))}px` }} />
                <span className="w-1 bg-teal-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(20, (audioLevel + (latestUserText ? 8 : 0)) * 1.1))}px` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(24, (audioLevel + (latestUserText ? 14 : 0)) * 1.4))}px` }} />
                <span className="w-1 bg-teal-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(18, (audioLevel + (latestUserText ? 9 : 0)) * 1.0))}px` }} />
              </div>
            </div>
          )}

          {callStatus === 'thinking' && (
            <div className="flex items-center justify-center gap-2 text-amber-300 font-medium text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{t.thinking}</span>
            </div>
          )}

          {callStatus === 'speaking' && (
            <div className="flex items-center justify-center gap-2 text-[#F5A898] font-medium text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-3.5 bg-[#F07B6B] wave-bar rounded-full" />
                <span className="w-1.5 h-5 bg-[#F5A898] wave-bar rounded-full delay-100" />
                <span className="w-1.5 h-3 bg-[#F07B6B] wave-bar rounded-full delay-200" />
              </div>
              <span>{t.speaking}</span>
            </div>
          )}

          {/* Dynamic Action Buttons */}
          {callStatus === 'listening' ? (
            <div className="pt-2 flex flex-col items-center gap-1.5">
              {/* Live Speech Recognition Transcript Floating Pill */}
              {latestUserText && (
                <div className="max-w-xs mx-auto mb-1 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 text-[11px] font-medium flex items-center justify-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="truncate">"{latestUserText}"</span>
                </div>
              )}

              <button
                onClick={() => handleUserFinishedSpeaking()}
                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl mx-auto active:scale-95 cursor-pointer border-2 ${
                  latestUserText.trim()
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/40 border-emerald-300/50 animate-pulse'
                    : 'bg-emerald-600/50 hover:bg-emerald-600/70 text-emerald-100 border-emerald-400/30'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {latestUserText.trim()
                    ? (lang === 'id' ? 'Selesai Curhat (Kirim ke Momly) ✨' : 'Done Speaking (Send to Momly) ✨')
                    : (lang === 'id' ? 'Momly Mendengarkan (Bicara Saja Langsung) 🎙️' : 'Momly is Listening (Speak Freely) 🎙️')}
                </span>
              </button>

              <p className="text-[10px] text-slate-300/80 px-2 italic text-center">
                {lang === 'id'
                  ? 'Bicara saja langsung ya Mama, Momly otomatis menjawab saat ada jeda suara'
                  : 'Just speak naturally, Momly automatically replies after natural pauses'}
              </p>

              {micNotice && (
                <div className="text-amber-200 text-[11px] font-medium bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-400/40 animate-bounce text-center">
                  {micNotice}
                </div>
              )}
            </div>
          ) : callStatus === 'speaking' ? (
            <div className="pt-2">
              <button
                onClick={handleInterruptMomly}
                className="px-5 py-2.5 rounded-full bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/50 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer mx-auto active:scale-95 shadow-lg"
                title="Sela Momly untuk langsung bicara"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>
                  {lang === 'id' ? '✋ Sela Momly / Giliran Mama Bicara' : '✋ Interrupt Momly / Speak Now'}
                </span>
              </button>
            </div>
          ) : callStatus === 'thinking' ? (
            <div className="pt-2">
              <div className="px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse mx-auto">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{t.thinking}</span>
              </div>
            </div>
          ) : callStatus === 'connecting' ? (
            <div className="pt-2">
              <div className="px-5 py-2.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>{t.connecting}</span>
              </div>
            </div>
          ) : null}

          {/* Quick Voice / Text Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim() || latestUserText.trim()) {
                handleUserFinishedSpeaking(textInput.trim() || latestUserText.trim());
              }
            }}
            className="w-full max-w-sm mx-auto flex items-center gap-1.5 mt-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                lang === 'id'
                  ? (latestUserText && callStatus === 'listening' ? `Mic: "${latestUserText}"` : 'Bicara ke mic atau ketik di sini...')
                  : (latestUserText && callStatus === 'listening' ? `Mic: "${latestUserText}"` : 'Speak into mic or type here...')
              }
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-3.5 py-2 text-xs text-white placeholder-[#9B8EC4] focus:outline-none focus:ring-1 focus:ring-[#F07B6B] backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!textInput.trim() && !latestUserText.trim()}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 disabled:opacity-30 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{lang === 'id' ? 'Kirim' : 'Send'}</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Live Captions */}
          {showCaptions && (
            <div className="mt-3 p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-[#EEE8FF] min-h-[72px] flex flex-col items-center justify-center text-center">
              {callStatus === 'listening' && latestUserText && (
                <p className="italic text-emerald-200">"{latestUserText}"</p>
              )}
              {callStatus === 'thinking' && (
                <div className="flex items-center gap-2 text-amber-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <p className="italic">"{t.thinking}..."</p>
                </div>
              )}
              {callStatus === 'speaking' && latestModelText && (
                <p className="text-white font-medium">"{latestModelText}"</p>
              )}
              {!latestUserText && callStatus === 'listening' && (
                <p className="text-[#9B8EC4] text-[11px]">{t.tapToTalk}</p>
              )}
              {callStatus === 'connecting' && (
                <p className="text-rose-200 text-[11px] italic">{t.connecting}</p>
              )}
            </div>
          )}

          {/* Emergency Crisis Escalation Card */}
          {safetyAlert && (
            <div className="mt-3 p-3.5 rounded-2xl bg-rose-950/85 border border-rose-400/50 backdrop-blur-md text-left shadow-2xl animate-fade-in w-full">
              <div className="flex items-center justify-between pb-1.5 border-b border-rose-400/20 mb-2">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{lang === 'id' ? 'Bantuan Darurat & Profesional' : 'Emergency & Professional Help'}</span>
                </div>
                <button
                  onClick={() => setSafetyAlert(null)}
                  className="text-xs text-rose-300/70 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                  title="Tutup kartu bantuan"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-rose-100/90 leading-relaxed mb-2.5">
                {lang === 'id'
                  ? 'Mama tidak sendirian. Jika sedang dalam krisis, bahaya, atau membutuhkan pertolongan segera, mohon hubungi layanan bantuan resmi berikut atau orang terdekat:'
                  : 'You are not alone. If you are experiencing crisis, acute distress, or danger, please contact official resources or a trusted person nearby:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                {safetyAlert.emergencyResources.slice(0, 4).map((res, idx) => (
                  <a
                    key={idx}
                    href={res.actionUrl || '#'}
                    target={res.actionUrl?.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 border border-rose-400/30 text-white text-xs font-semibold transition-all active:scale-[0.98]"
                  >
                    {res.actionUrl?.startsWith('http') ? (
                      <ExternalLink className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    ) : (
                      <PhoneCall className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-[10px] text-rose-200/80 truncate">{res.name}</div>
                      <div className="font-bold text-white text-[11px] truncate">{res.numberOrContact}</div>
                    </div>
                  </a>
                ))}
              </div>
              <p className="text-[9px] text-slate-300/70 italic text-center">
                {lang === 'id'
                  ? 'Momly adalah AI pendengar, bukan pengganti layanan darurat, diagnosis medis, atau psikiater.'
                  : 'Momly is an AI companion, not an emergency service, medical diagnosis, or psychiatric care.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center pb-4 space-y-4">
        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#9B8EC4] hover:text-[#EEE8FF] transition-colors cursor-pointer"
        >
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>{showCaptions ? t.hideCaptions : t.showCaptions}</span>
        </button>

        <div className="flex items-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#F07B6B] text-white shadow-lg shadow-[#F07B6B]/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? t.unmute : t.mute}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-900/50 transition-all cursor-pointer"
            title={t.endCall}
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              !isSpeakerOn
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpeakerOn ? t.speakerOn : t.speakerOff}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
