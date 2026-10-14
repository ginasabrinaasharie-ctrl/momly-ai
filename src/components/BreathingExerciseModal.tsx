import React, { useState, useEffect } from 'react';
import { X, Heart, RefreshCw } from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language, translations } from '../services/i18n.ts';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');

  const t = translations[lang].breathing;

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(30);
      setIsActive(true);
      setPhase('inhale');
    } else {
      setIsActive(false);
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsRemaining]);

  // Breathing phase cycle (4s inhale -> 4s hold -> 4s exhale)
  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return;

    const elapsed = 30 - secondsRemaining;
    const cyclePos = elapsed % 12;

    if (cyclePos < 4) {
      setPhase('inhale');
    } else if (cyclePos < 8) {
      setPhase('hold');
    } else {
      setPhase('exhale');
    }
  }, [secondsRemaining, isActive]);

  if (!isOpen) return null;

  const phaseInstruction = {
    inhale: {
      text: t.inhaleText,
      sub: t.inhaleSub,
      color: 'text-[#F07B6B]',
      scale: 'scale-125',
    },
    hold: {
      text: t.holdText,
      sub: t.holdSub,
      color: 'text-[#6B5FA0]',
      scale: 'scale-125',
    },
    exhale: {
      text: t.exhaleText,
      sub: t.exhaleSub,
      color: 'text-[#9B8EC4]',
      scale: 'scale-90',
    },
    rest: {
      text: t.finishedText,
      sub: t.finishedSub,
      color: 'text-emerald-600',
      scale: 'scale-100',
    },
  }[secondsRemaining === 0 ? 'rest' : phase];

  const handleRestart = () => {
    setSecondsRemaining(30);
    setIsActive(true);
    setPhase('inhale');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#FDDDD8] overflow-hidden text-center">
        {/* Background ambient orbs */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#FDDDD8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-[#EEE8FF]/70 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <MomlyAvatar size="sm" pose="calm" />
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#1C1228]">{t.title}</h3>
            <p className="text-[10px] text-[#8B7FA0]">{t.subtitle}</p>
          </div>
        </div>

        {/* Visual Breathing Circle */}
        <div className="relative my-6 flex items-center justify-center h-44">
          <div
            className={`absolute w-40 h-40 rounded-full bg-[#FDDDD8]/40 transition-transform duration-3000 ease-in-out ${
              secondsRemaining > 0 ? phaseInstruction.scale : 'scale-100'
            }`}
          />
          <div
            className={`absolute w-32 h-32 rounded-full bg-[#EEE8FF]/70 transition-transform duration-2500 ease-in-out ${
              secondsRemaining > 0 ? phaseInstruction.scale : 'scale-100'
            }`}
          />

          <div
            className={`relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#F07B6B] to-[#F5A898] flex flex-col items-center justify-center text-white shadow-lg shadow-[#F07B6B]/25 transition-transform duration-3000 ease-in-out ${
              secondsRemaining > 0 ? phaseInstruction.scale : 'scale-100'
            }`}
          >
            {secondsRemaining > 0 ? (
              <>
                <span className="text-2xl font-bold font-mono">{secondsRemaining}s</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  {phase}
                </span>
              </>
            ) : (
              <Heart className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>

        {/* Phase Text & Instructions */}
        <div className="mb-4 space-y-1">
          <h4 className={`text-base sm:text-lg font-bold transition-all ${phaseInstruction.color}`}>
            {phaseInstruction.text}
          </h4>
          <p className="text-[11px] text-[#8B7FA0]">{phaseInstruction.sub}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EEE8FF] rounded-full h-1.5 mb-5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#F07B6B] to-[#9B8EC4] h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${((30 - secondsRemaining) / 30) * 100}%` }}
          />
        </div>

        {/* Action Controls */}
        {secondsRemaining === 0 ? (
          <div className="space-y-2">
            <div className="p-3 bg-[#FDDDD8]/40 rounded-2xl text-[11px] text-[#1C1228] leading-relaxed">
              {t.congratsTitle}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl border border-[#F07B6B] text-[#F07B6B] hover:bg-[#FDDDD8]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {t.repeat}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 text-white font-semibold text-xs shadow-sm shadow-[#F07B6B]/20 transition-all cursor-pointer"
              >
                {t.done}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-[#8B7FA0] italic">{t.quote}</p>
        )}
      </div>
    </div>
  );
};
