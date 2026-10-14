import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, MessageSquareHeart, Send } from 'lucide-react';
import { speechService } from '../services/speechService.ts';
import { geminiCompanion } from '../services/geminiVoiceCompanion.ts';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language, translations } from '../services/i18n.ts';

interface CallScreenProps {
  onEndCall: () => void;
  lang: Language;
}

export const CallScreen: React.FC<CallScreenProps> = ({ onEndCall, lang }) => {
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

    // CASE 1: Transcribed text or typed text is available
    if (textToSend) {
      setMicNotice('');
      setTextInput('');
      setCallStatus('thinking');

      try {
        const response = await geminiCompanion.respondToMother(textToSend);
        setLatestModelText(response);

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#1C1228] via-[#2D2040] to-[#1C1228] text-white p-5 sm:p-8 select-none max-w-md mx-auto sm:rounded-[36px] overflow-hidden shadow-2xl">
      {/* Top Header: Logo, Name & Duration */}
      <div className="flex flex-col items-center pt-6 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07B6B]/15 border border-[#F07B6B]/30 text-[#F5A898] text-[11px] font-medium">
          <Sparkles className="w-3 h-3 text-[#F07B6B] animate-spin" />
          <span>{t.substatus}</span>
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
            <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping" />
          )}

          {/* Momly Illustrated Avatar */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#F07B6B] via-[#F5A898] to-[#9B8EC4] shadow-2xl shadow-[#F07B6B]/30">
            <MomlyAvatar
              size="xl"
              pose={
                callStatus === 'speaking'
                  ? 'supportive'
                  : callStatus === 'thinking'
                  ? 'understanding'
                  : callStatus === 'connecting'
                  ? 'winking'
                  : 'listening'
              }
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
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-medium text-xs sm:text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${audioLevel > 3 ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                <span>{audioLevel > 3 ? (lang === 'id' ? 'Suara Mama Terdengar...' : 'Hearing Mama...') : t.listening}</span>
              </div>
              {/* Dynamic VU Meter bars responding to physical mic volume */}
              <div className="flex items-center gap-1 h-5 justify-center">
                <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(20, audioLevel * 1.2))}px` }} />
                <span className="w-1 bg-emerald-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(24, audioLevel * 1.6))}px` }} />
                <span className="w-1 bg-teal-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(20, audioLevel * 1.3))}px` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(22, audioLevel * 1.5))}px` }} />
                <span className="w-1 bg-teal-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(16, audioLevel * 1.0))}px` }} />
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
              <button
                onClick={() => handleUserFinishedSpeaking()}
                className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl mx-auto active:scale-95 cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/40 animate-pulse border-2 border-emerald-300/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {latestUserText.trim()
                    ? (lang === 'id' ? 'Selesai Bicara (Kirim ke Momly) ✨' : 'Done Speaking (Send to Momly) ✨')
                    : (lang === 'id' ? 'Selesai Bicara (Ketuk untuk Jawab) ✨' : 'Done Speaking (Tap to Reply) ✨')}
                </span>
              </button>
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
