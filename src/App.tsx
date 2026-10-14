import { useState, useEffect } from 'react';
import {
  Phone,
  Wind,
  BookOpen,
  MessageCircleHeart,
  Globe,
  Heart,
  BookHeart,
} from 'lucide-react';
import { CallScreen } from './components/CallScreen.tsx';
import { EmpathySummaryModal } from './components/EmpathySummaryModal.tsx';
import { MoodCheckIn, MoodOption } from './components/MoodCheckIn.tsx';
import { BreathingExerciseModal } from './components/BreathingExerciseModal.tsx';
import {
  ConversationMemoryModal,
  StoredMemory,
} from './components/ConversationMemoryModal.tsx';
import { LanguageSelectModal } from './components/LanguageSelectModal.tsx';
import { UserOnboardingModal } from './components/UserOnboardingModal.tsx';
import { MomlyAvatar } from './components/MomlyAvatar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { geminiCompanion } from './services/geminiVoiceCompanion.ts';
import { speechService } from './services/speechService.ts';
import { usageGuard, AuthUser } from './services/usageGuard.ts';
import { Language, translations } from './services/i18n.ts';

export function App() {
  // Language state (default to English as requested)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('momly_lang');
    return (saved as Language) || 'en';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'breathe' | 'journal'>('home');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // User Profile Name State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('momly_user_name') || '';
  });
  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return usageGuard.getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    return !usageGuard.isAuthenticated();
  });

  const [showNameModal, setShowNameModal] = useState(false);
  const [isInitialOnboarding, setIsInitialOnboarding] = useState(false);

  // Call & Summary states
  const [isCalling, setIsCalling] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    headline: string;
    message: string;
    sentimentTag: string;
    tips: string[];
  } | null>(null);

  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memories, setMemories] = useState<StoredMemory[]>([]);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setUserName(user.name);
    setShowAuthModal(false);
    geminiCompanion.setUserName(user.name);
  };

  // Sync language & userName with services
  useEffect(() => {
    geminiCompanion.setLanguage(lang);
    geminiCompanion.setUserName(userName);
    speechService.setLanguage(lang);
    localStorage.setItem('momly_lang', lang);
  }, [lang, userName]);

  // Load memories from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('momly_memories');
      if (saved) {
        setMemories(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load memories:', e);
    }
  }, []);

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    setSelectedMood(null); // Reset mood translation for current language
  };

  const handleSaveName = (name: string) => {
    const clean = name.trim();
    setUserName(clean);
    localStorage.setItem('momly_user_name', clean);
    localStorage.setItem('momly_onboarding_shown', 'true');
    geminiCompanion.setUserName(clean);
    setShowNameModal(false);
    setIsInitialOnboarding(false);
  };

  const handleSelectMood = (mood: MoodOption) => {
    setSelectedMood(mood);
    geminiCompanion.setMoodContext(mood.label);
  };

  const startCall = () => {
    geminiCompanion.resetConversation();
    geminiCompanion.setLanguage(lang);
    geminiCompanion.setUserName(userName);
    speechService.setLanguage(lang);
    speechService.ensureAudioContextRunning();
    if (selectedMood) {
      geminiCompanion.setMoodContext(selectedMood.label);
    }
    setIsCalling(true);
  };

  const endCall = async () => {
    setIsCalling(false);
    setIsSummarizing(true);
    try {
      const summary = await geminiCompanion.generateEmpathySummary();
      setSummaryData(summary);

      // Save to Conversation Memory
      const newMemory: StoredMemory = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        headline: summary.headline,
        message: summary.message,
        sentimentTag: summary.sentimentTag,
        tips: summary.tips,
      };

      const updatedMemories = [newMemory, ...memories].slice(0, 50);
      setMemories(updatedMemories);
      try {
        localStorage.setItem('momly_memories', JSON.stringify(updatedMemories));
      } catch (storageErr) {
        console.warn('Storage quota exceeded, unable to persist new memory:', storageErr);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleClearMemories = () => {
    setMemories([]);
    localStorage.removeItem('momly_memories');
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#F7F4FA] sm:py-6 flex items-center justify-center font-sans antialiased text-[#1C1228]">
      {/* Mobile-First App Container Frame */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-[#FDFCFF] sm:rounded-[40px] shadow-2xl sm:border sm:border-[#FDDDD8] overflow-hidden flex flex-col relative select-none">
        
        {/* Top Mobile App Header */}
        <header className="w-full border-b border-[#FDDDD8]/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <MomlyAvatar size="sm" pose="winking" />
            <img
              src="/assets/momly/logo.png"
              alt="Momly - Your AI bestie, always here"
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* User Nickname / Judge Pill */}
            <button
              onClick={() => setShowAuthModal(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                currentUser?.role === 'judge'
                  ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-300/40'
                  : 'border-[#FDDDD8] bg-[#FFF8F2] hover:bg-[#FDDDD8]/50 text-[#1C1228]'
              }`}
              title={
                currentUser?.role === 'judge'
                  ? (lang === 'id' ? 'Akses Juri AI Builder Cup (Klik untuk ganti profil)' : 'AI Builder Cup Judge Pass (Click to switch)')
                  : (lang === 'id' ? 'Ubah Profil' : 'Edit Profile')
              }
            >
              <span className="text-[11px]">{currentUser?.role === 'judge' ? '⭐' : '💕'}</span>
              <span className="font-bold text-[11px] max-w-[105px] truncate">
                {currentUser?.role === 'judge'
                  ? (lang === 'id' ? 'Mode Juri' : 'Judge Mode')
                  : (userName ? `Mama ${userName}` : (lang === 'id' ? '+ Nama' : '+ Name'))}
              </span>
            </button>

            {/* Language Switcher Pill */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FDDDD8] bg-[#FDDDD8]/40 hover:bg-[#FDDDD8]/70 text-xs font-semibold text-[#F07B6B] transition-all cursor-pointer shadow-2xs shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px] font-bold">
                {lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}
              </span>
            </button>
          </div>
        </header>

        {/* Tab 1: Companion (Main Voice Screen) */}
        {activeTab === 'home' && (
          <main className="flex-1 px-4 py-5 flex flex-col items-center justify-between text-center overflow-y-auto pb-24">
            {/* Daily Affirmation Card matching Screen 04 */}
            <div className="w-full mb-3.5 p-3.5 rounded-3xl bg-gradient-to-r from-[#FDDDDB]/70 via-[#EEE8FF]/70 to-[#FFF8F2] border border-[#FDDDDB] shadow-xs flex items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B5FA0]">
                  {lang === 'id' ? 'Pesan Hari Ini 💜' : 'Daily Affirmation 💜'}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1C1228] leading-snug">
                  {lang === 'id'
                    ? 'Langkah kecilmu tetap berarti besar. Momly bangga sama Mama 🌸'
                    : 'Small steps still make a big difference. I’m proud of you, Mama 🌸'}
                </p>
              </div>
              <MomlyAvatar size="md" pose="bestie" className="shrink-0" />
            </div>
            {/* Hero Headline */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1228] leading-tight mb-2">
                {userName ? (
                  <>
                    {lang === 'id' ? 'Hai, Mama' : 'Hey, Mama'}{' '}
                    <span className="bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#9B8EC4] bg-clip-text text-transparent">
                      {userName} 💕
                    </span>
                  </>
                ) : (
                  <>
                    {t.heroHeadline}{' '}
                    <span className="bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#9B8EC4] bg-clip-text text-transparent">
                      {t.heroHeadlineHighlight}
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                {t.heroSubheadline}
              </p>
            </div>

            {/* Feature 2: Mood Check-in Widget */}
            <MoodCheckIn
              lang={lang}
              selectedMood={selectedMood}
              onSelectMood={handleSelectMood}
            />

            {/* Feature 1: Big Pulse Voice Call Button */}
            <div className="w-full relative flex flex-col items-center my-3 p-4 rounded-3xl bg-gradient-to-b from-[#FDDDDB]/30 to-transparent border border-[#FDDDDB]/60">
              {/* Title & Badge */}
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDDDDB] border border-[#F07B6B]/20 text-[#F07B6B] text-[11px] font-bold tracking-wide shadow-2xs">
                  <span>🎙️</span>
                  <span>{lang === 'id' ? 'Curhat ke Momly' : 'Heart-to-Heart with Momly'}</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {lang === 'id'
                    ? 'Telepon teman terbaikmu, tumpahkan isi hatimu tanpa dihakimi'
                    : 'Call your AI bestie, express your heart with zero judgment'}
                </p>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="absolute -inset-4 rounded-full bg-[#F07B6B]/20 blur-xl animate-pulse pointer-events-none" />

                <button
                  onClick={startCall}
                  className="relative group w-24 h-24 rounded-full bg-gradient-to-tr from-[#F07B6B] via-[#F5A898] to-[#F07B6B] hover:scale-105 active:scale-95 text-white flex flex-col items-center justify-center shadow-xl shadow-[#F07B6B]/40 transition-all border-4 border-white cursor-pointer"
                >
                  <Phone className="w-9 h-9 animate-bounce" />
                </button>

                <span className="mt-3 text-xs font-bold text-[#F07B6B] tracking-wide">
                  {t.callButtonLabel}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {t.callButtonSubtext}
                </span>
              </div>
            </div>

            {/* "Let's take a moment" 4 Action Cards matching Screen 04 */}
            <div className="w-full mt-4 text-left">
              <p className="text-[11px] font-bold text-[#6B5FA0] uppercase tracking-wider mb-2.5">
                {lang === 'id' ? 'Mari Ambil Waktu Sejenak' : "Let's take a moment"}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Talk to Momly */}
                <button
                  onClick={startCall}
                  className="p-3 rounded-2xl bg-gradient-to-br from-[#FDDDDB]/60 to-[#FFF8F2] border border-[#FDDDDB] hover:shadow-xs active:scale-98 transition-all text-left flex items-start gap-2.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F07B6B]/15 text-[#F07B6B] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1C1228]">
                      {lang === 'id' ? 'Bicara ke Momly' : 'Talk to Momly'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'id' ? 'Suara & curhat' : 'Voice companion'}
                    </p>
                  </div>
                </button>

                {/* 2. Mood Check-in */}
                <button
                  onClick={() => {
                    const el = document.getElementById('mood-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-br from-[#EEE8FF]/70 to-[#FFF8F2] border border-[#EEE8FF] hover:shadow-xs active:scale-98 transition-all text-left flex items-start gap-2.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6B5FA0]/15 text-[#6B5FA0] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1C1228]">
                      {lang === 'id' ? 'Mood Check-in' : 'Mood Check-in'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'id' ? 'Bagaimana rasanya?' : 'How do you feel?'}
                    </p>
                  </div>
                </button>

                {/* 3. Breathing Exercise */}
                <button
                  onClick={() => setShowBreathingModal(true)}
                  className="p-3 rounded-2xl bg-gradient-to-br from-[#E6F4EA] to-[#FFF8F2] border border-[#CEEAD6] hover:shadow-xs active:scale-98 transition-all text-left flex items-start gap-2.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1C1228]">
                      {lang === 'id' ? 'Latihan Nafas' : 'Breathing Reset'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'id' ? 'Tenangkan pikiran' : 'Calm your mind'}
                    </p>
                  </div>
                </button>

                {/* 4. My Journal */}
                <button
                  onClick={() => setActiveTab('journal')}
                  className="p-3 rounded-2xl bg-gradient-to-br from-[#FFF3E0] to-[#FFF8F2] border border-[#FFE0B2] hover:shadow-xs active:scale-98 transition-all text-left flex items-start gap-2.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600/15 text-amber-600 flex items-center justify-center shrink-0">
                    <BookHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1C1228]">
                      {lang === 'id' ? 'Surat Cinta' : 'Heart Journal'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'id' ? 'Refleksi & memori' : 'Reflect & grow'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Tab 2: Breathe (Full-screen Mobile Breathing View) */}
        {activeTab === 'breathe' && (
          <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center text-center overflow-y-auto pb-24">
            <div className="w-full max-w-xs space-y-4">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[#EEE8FF] text-[#6B5FA0] flex items-center justify-center text-2xl shadow-xs">
                🫁
              </div>
              <h2 className="text-xl font-bold text-[#1C1228]">{t.breathing.title}</h2>
              <p className="text-xs text-[#8B7FA0] leading-relaxed">
                {t.breathing.subtitle}
              </p>

              <div className="p-4 rounded-3xl bg-[#FDDDD8]/30 border border-[#FDDDD8] text-xs text-slate-700 italic">
                {t.breathing.quote}
              </div>

              <button
                onClick={() => setShowBreathingModal(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#F07B6B]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wind className="w-4 h-4" />
                <span>{lang === 'id' ? 'Mulai Sesi Nafas 30 Detik' : 'Start 30-Second Breath'}</span>
              </button>
            </div>
          </main>
        )}

        {/* Tab 3: Journal (Heart Journal View) */}
        {activeTab === 'journal' && (
          <main className="flex-1 px-4 py-6 flex flex-col text-left overflow-y-auto pb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1C1228]">{t.journal.title}</h2>
                <p className="text-[11px] text-[#8B7FA0]">{t.journal.subtitle}</p>
              </div>
              {memories.length > 0 && (
                <button
                  onClick={handleClearMemories}
                  className="text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  {t.journal.clearAll}
                </button>
              )}
            </div>

            {memories.length === 0 ? (
              <div className="my-auto py-12 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EEE8FF] text-[#9B8EC4] flex items-center justify-center text-xl">
                  💌
                </div>
                <p className="text-xs font-bold text-slate-700">{t.journal.emptyTitle}</p>
                <p className="text-[11px] text-[#8B7FA0] max-w-xs mx-auto">
                  {t.journal.emptyDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FDFCFF] to-[#F8F5FF] border border-[#EEE8FF] shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDDDD8] text-[#F07B6B]">
                        {item.sentimentTag}
                      </span>
                      <span className="text-[10px] text-[#8B7FA0]">{item.timestamp}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1C1228] mb-1">
                      {item.headline}
                    </h4>

                    <p className="text-[11px] text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-slate-100 mb-2 leading-relaxed">
                      "{item.message}"
                    </p>

                    {item.tips && item.tips.length > 0 && (
                      <ul className="text-[10px] text-slate-600 space-y-0.5 list-disc list-inside">
                        {item.tips.map((tipText, idx) => (
                          <li key={idx}>{tipText}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* Mobile App Bottom Navigation Bar */}
        <nav className="w-full bg-white/95 backdrop-blur-md border-t border-[#FDDDD8]/80 py-2 px-6 flex items-center justify-around absolute bottom-0 left-0 right-0 z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#F07B6B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageCircleHeart className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.bottomNav.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('breathe')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'breathe' ? 'text-[#6B5FA0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wind className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.bottomNav.breathe}</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer relative ${
              activeTab === 'journal' ? 'text-[#F07B6B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <BookOpen className="w-5 h-5" />
              {memories.length > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#F07B6B] text-white text-[8px] flex items-center justify-center font-bold">
                  {memories.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">{t.bottomNav.journal}</span>
          </button>
        </nav>

        {/* Active In-Call Screen Overlay */}
        {isCalling && (
          <CallScreen
            onEndCall={endCall}
            lang={lang}
          />
        )}

        {/* Summarizing loader */}
        {isSummarizing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1C1228]/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-5 text-center space-y-3 max-w-xs shadow-2xl border border-[#FDDDD8]">
              <MomlyAvatar size="md" className="mx-auto" isSpeaking={true} />
              <p className="text-xs font-semibold text-[#1C1228]">
                {t.loveLetter.generatingMessage}
              </p>
            </div>
          </div>
        )}

        {/* Post-Call Love Letter Modal */}
        {summaryData && (
          <EmpathySummaryModal
            summary={summaryData}
            onClose={() => setSummaryData(null)}
            lang={lang}
          />
        )}

        {/* Breathing Exercise Modal */}
        <BreathingExerciseModal
          isOpen={showBreathingModal}
          onClose={() => setShowBreathingModal(false)}
          lang={lang}
        />

        {/* Conversation Memory Modal */}
        <ConversationMemoryModal
          isOpen={showMemoryModal}
          onClose={() => setShowMemoryModal(false)}
          memories={memories}
          onClearMemories={handleClearMemories}
          lang={lang}
        />

        {/* Language Selection Modal */}
        <LanguageSelectModal
          isOpen={showLanguageModal}
          currentLang={lang}
          onSelectLang={handleSelectLang}
          onClose={() => setShowLanguageModal(false)}
        />

        {/* User Nickname / Onboarding Modal */}
        {showNameModal && (
          <UserOnboardingModal
            currentName={userName}
            onSaveName={handleSaveName}
            onClose={() => {
              setShowNameModal(false);
              setIsInitialOnboarding(false);
            }}
            lang={lang}
            isInitialSetup={isInitialOnboarding}
          />
        )}

        {/* AI Builder Cup Authentication & Judge Gate Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onSuccess={handleAuthSuccess}
          lang={lang}
        />
      </div>
    </div>
  );
}

export default App;
