import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, MessageSquareHeart } from 'lucide-react';
import { speechService } from '../services/speechService.ts';
import { geminiCompanion } from '../services/geminiVoiceCompanion.ts';

interface CallScreenProps {
  onEndCall: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({ onEndCall }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [latestUserText, setLatestUserText] = useState('');
  const [latestModelText, setLatestModelText] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer panggilan
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Mulai mendengarkan suara ibu
  const startListeningLoop = () => {
    if (isMuted) return;

    setCallStatus('listening');
    speechService.startListening({
      onResult: (text: string) => {
        setLatestUserText(text);

        // Reset timer keheningan (jika ibu berhenti bicara selama 1.5 detik, kirim ke AI)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          handleUserFinishedSpeaking(text);
        }, 1600);
      },
      onError: (err: string) => {
        console.warn('Speech err:', err);
      },
      onEnd: () => {
        // Jika status masih listening dan belum diproses, loop kembali
        if (callStatus === 'listening' && !isMuted) {
          // Restart after short break if no pending utterance
        }
      }
    });
  };

  const handleUserFinishedSpeaking = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    speechService.stopListening();
    setCallStatus('thinking');

    try {
      const response = await geminiCompanion.respondToMother(spokenText);
      setLatestModelText(response);

      if (isSpeakerOn) {
        setCallStatus('speaking');
        await speechService.speak(
          response,
          () => setCallStatus('speaking'),
          () => {
            // Selesai berbicara, dengarkan ibu lagi
            setLatestUserText('');
            startListeningLoop();
          }
        );
      } else {
        startListeningLoop();
      }
    } catch (e) {
      console.error(e);
      startListeningLoop();
    }
  };

  // Inisialisasi awal saat panggilan tersambung
  useEffect(() => {
    // Sapaan awal dari Bunda Rina
    const initialGreeting = "Halo Bunda... Senang banget bisa dengar kabar Bunda hari ini. Gimana perasaan Bunda sekarang? Aku di sini siap mendengarkan...";
    setLatestModelText(initialGreeting);
    setCallStatus('speaking');

    speechService.speak(
      initialGreeting,
      () => setCallStatus('speaking'),
      () => {
        startListeningLoop();
      }
    );

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 select-none">
      {/* Top Header: Nama & Durasi */}
      <div className="flex flex-col items-center pt-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
          <span>Google Cloud AI Voice Active</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-100">Bunda Rina</h2>
        <p className="text-rose-300/80 text-sm font-medium">Sahabat & Pendengar Setia Mama</p>
        <span className="text-xl sm:text-2xl font-mono text-emerald-400 tracking-wider">
          {formatTime(duration)}
        </span>
      </div>

      {/* Center: Avatar Pulse & Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto space-y-8">
        <div className="relative flex items-center justify-center">
          {/* Wave animation circles */}
          {callStatus === 'speaking' && (
            <>
              <div className="absolute w-64 h-64 rounded-full bg-rose-500/20 animate-pulse-ring" />
              <div className="absolute w-80 h-80 rounded-full bg-rose-400/10 animate-pulse-ring delay-300" />
            </>
          )}

          {callStatus === 'listening' && (
            <div className="absolute w-56 h-56 rounded-full bg-emerald-500/20 animate-ping" />
          )}

          {/* Avatar Core */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 shadow-2xl shadow-rose-950">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white/20">
              <span className="text-6xl sm:text-7xl select-none">🌸</span>
            </div>
          </div>
        </div>

        {/* State Label */}
        <div className="text-center space-y-2 max-w-md px-4">
          {callStatus === 'listening' && (
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-medium animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Bunda Rina sedang mendengarkan Bunda...</span>
            </div>
          )}

          {callStatus === 'thinking' && (
            <div className="flex items-center justify-center gap-2 text-amber-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Bunda Rina sedang memahami curhatanmu...</span>
            </div>
          )}

          {callStatus === 'speaking' && (
            <div className="flex items-center justify-center gap-2 text-rose-300 font-medium">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-rose-400 wave-bar rounded-full" />
                <span className="w-1.5 h-6 bg-rose-300 wave-bar rounded-full delay-100" />
                <span className="w-1.5 h-3 bg-rose-400 wave-bar rounded-full delay-200" />
              </div>
              <span>Bunda Rina sedang berbicara...</span>
            </div>
          )}

          {/* Live Captions / Subtitles */}
          {showCaptions && (
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-sm text-slate-200 min-h-[72px] flex items-center justify-center text-center">
              {callStatus === 'listening' && latestUserText && (
                <p className="italic text-emerald-200">"{latestUserText}"</p>
              )}
              {callStatus === 'speaking' && latestModelText && (
                <p className="text-rose-100 font-medium">"{latestModelText}"</p>
              )}
              {!latestUserText && callStatus === 'listening' && (
                <p className="text-slate-400 text-xs">Ceritakan apa saja Bun, jangan ragu...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center pb-6 space-y-6">
        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className="inline-flex items-center gap-1.5 text-xs text-rose-300/70 hover:text-rose-200 transition-colors"
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>{showCaptions ? 'Sembunyikan Teks' : 'Tampilkan Teks Curhat'}</span>
        </button>

        <div className="flex items-center gap-6 sm:gap-8">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Nyalakan Mikrofon' : 'Matikan Mikrofon'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call Button (Big Red) */}
          <button
            onClick={onEndCall}
            className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-900/50 transition-all"
            title="Akhiri Telepon Curhat"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              !isSpeakerOn
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpeakerOn ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};
