import React from 'react';
import {
  Phone,
  Sparkles,
  BookHeart,
  Wind,
  ShieldCheck,
  ArrowRight,
  Globe,
  Volume2,
} from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language } from '../services/i18n.ts';

interface LandingPageProps {
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenAuth: () => void;
  onDemoJudge: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onSelectLang,
  onOpenAuth,
  onDemoJudge,
}) => {
  const isId = lang === 'id';

  return (
    <div className="min-h-screen bg-[#F7F4FA] sm:py-6 flex items-center justify-center font-sans antialiased text-[#1C1228]">
      {/* Mobile-First App Container Frame */}
      <div className="w-full max-w-md h-screen h-dvh sm:h-[844px] sm:max-h-[844px] bg-[#FDFCFF] sm:rounded-[40px] shadow-2xl sm:border sm:border-[#FDDDD8] overflow-hidden flex flex-col relative select-none">
        
        {/* Sticky Header */}
        <header className="w-full border-b border-[#FDDDD8]/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3.5 py-2.5 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 shrink-0">
            <MomlyAvatar size="sm" pose="winking" />
            <img
              src="/assets/momly/logo.png"
              alt="Momly - Your AI bestie, always here"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => onSelectLang(isId ? 'en' : 'id')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#FDDDD8] bg-[#FDDDD8]/40 hover:bg-[#FDDDD8]/70 text-[10px] font-bold text-[#F07B6B] transition-all cursor-pointer shadow-2xs"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe className="w-3 h-3 shrink-0" />
              <span>{isId ? '🇮🇩 ID' : '🇺🇸 EN'}</span>
            </button>

            {/* Direct Login Button */}
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-full bg-[#F07B6B] hover:bg-[#E06B5B] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              {isId ? 'Masuk' : 'Sign In'}
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-thin">
          
          {/* Hero Section */}
          <section className="text-center space-y-3 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFF0ED] to-[#EEE8FF] border border-[#FDDDD8] text-[11px] font-bold text-[#F07B6B] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isId ? 'Teman Curhat & Sahabat AI Khusus Mama' : 'AI Voice Companion for Mothers'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1228] leading-tight px-1">
              {isId ? (
                <>
                  Mama Juga Butuh Didengar,{' '}
                  <span className="text-[#F07B6B] underline decoration-[#FDDDD8] decoration-wavy">
                    Tanpa Dihakimi.
                  </span>
                </>
              ) : (
                <>
                  Every Mother Deserves a Safe Space to be{' '}
                  <span className="text-[#F07B6B] underline decoration-[#FDDDD8] decoration-wavy">
                    Heard & Validated.
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              {isId
                ? 'Ruang hangat untuk melepas lelah, mencurahkan unek-unek harian lewat telepon suara alami, dan menemukan kembali ketenangan batin.'
                : 'A warm, judgment-free sanctuary to release exhaustion, share unspoken worries via natural voice calls, and restore your inner peace.'}
            </p>

            {/* Teaser Voice Greeting Card */}
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-[#FFF5F3] via-white to-[#F8F5FF] border border-[#FDDDD8] shadow-md text-left overflow-hidden">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="relative">
                  <MomlyAvatar size="md" pose="welcoming" isSpeaking={true} />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                    <Volume2 className="w-3 h-3 text-[#F07B6B] animate-pulse" />
                  </span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#1C1228] flex items-center gap-1">
                    <span>Momly</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#EEE8FF] text-[#6B5FA0] font-semibold">
                      Your AI Bestie
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {isId ? 'Siap mendengarkan kapan saja' : 'Always here to listen to you'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-[#FDDDD8]/60 text-xs italic text-slate-700 leading-relaxed relative">
                <span className="absolute -top-2 left-3 text-base">💬</span>
                {isId
                  ? '"Halo Mama sayang... apa yang paling bikin Mama lelah atau tersenyum hari ini? Ceritain ke Momly yuk, Momly dengerin."'
                  : '"Hi Mama love... what brought warmth or fatigue to your heart today? Tell me everything, I am right here listening."'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F59888] hover:opacity-95 active:scale-98 text-white font-bold text-sm shadow-lg shadow-[#F07B6B]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>{isId ? '🌸 Mulai Curhat Bersama Momly' : '🌸 Start Sharing with Momly'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onDemoJudge}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 active:scale-98 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <span>⭐ {isId ? 'Akses Cepat Mode Juri (1-Klik Tanpa Password)' : 'Quick 1-Click Judge Demo Mode'}</span>
              </button>
            </div>
          </section>

          {/* 3 Core Pillars */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B5FA0] text-center">
              {isId ? '3 Fitur Utama Sahabat Mama' : 'The 3 Pillars of Momly'}
            </h2>

            {/* Pillar 1: Curhat Suara Alami */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#FDDDD8] shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#FFF0ED] text-[#F07B6B] shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#1C1228] flex items-center gap-1">
                  <span>{isId ? 'Curhat Suara Alami' : 'Natural Voice Call'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Zero Judgement
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {isId
                    ? 'Bicara lisan layaknya menelepon sahabat karib. Momly merespons dengan suara hangat dan mengirimkan Surat Cinta rangkuman empati setelah telepon.'
                    : 'Talk directly just like calling your best friend. Momly listens attentively with a warm voice and sends an empathetic Love Letter summary after each call.'}
                </p>
              </div>
            </div>

            {/* Pillar 2: Jurnal Hati Mama */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EEE8FF] shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#EEE8FF] text-[#6B5FA0] shrink-0">
                <BookHeart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#1C1228] flex items-center gap-1">
                  <span>{isId ? 'Jurnal Hati Mama' : 'Heart Journal'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    5 Detik
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {isId
                    ? 'Catat rasa syukur dan kemenangan kecil harianmu lewat 1 ketukan cepat atau tinggal cerita lewat suara. Momly memvalidasi usahamu setiap hari.'
                    : 'Acknowledge daily gratitude and micro-wins in 5 seconds via quick chips or voice narration. Momly validates every single step you take.'}
                </p>
              </div>
            </div>

            {/* Pillar 3: Jeda Hati */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E0F2FE] shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#E0F2FE] text-sky-600 shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#1C1228] flex items-center gap-1">
                  <span>{isId ? 'Jeda Hati (Breathing)' : 'Breathing Sanctuary'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                    Tenang
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {isId
                    ? 'Latihan napas 4-7-8 interaktif untuk meredakan kepenatan atau kecemasan kapan pun Mama merasa kewalahan.'
                    : 'Interactive 4-7-8 breathing sanctuary to gently dissolve stress and sensory overload whenever you need a peaceful pause.'}
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Safety Guarantee */}
          <section className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-slate-50 border border-emerald-200/60 flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[10px] text-slate-600 leading-tight">
              {isId
                ? 'Ruang privasi 100% aman untuk Mama. Cerita dan jurnal tersimpan aman hanya di perangkatmu.'
                : '100% private and secure safe space. Your journals and memories are stored safely on your device.'}
            </p>
          </section>

          {/* Bottom Call to Action */}
          <section className="text-center pt-2 pb-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-700">
              {isId
                ? 'Mama tidak harus selalu kuat sendirian 💕'
                : 'You never have to carry it all alone, Mama 💕'}
            </p>
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6B5FA0] to-[#8B7FA0] hover:opacity-95 active:scale-98 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isId ? 'Masuk ke Aplikasi Momly' : 'Enter Momly Application'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400">
              Built with ❤️ for Google AI Builder Cup 2026
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
