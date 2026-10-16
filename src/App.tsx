import { useState, useEffect } from 'react';
import {
  Phone,
  Wind,
  MessageCircleHeart,
  Globe,
  BookHeart,
  Mail,
  LogOut,
  Edit3,
} from 'lucide-react';
import { CallScreen } from './components/CallScreen.tsx';
import { EmpathySummaryModal } from './components/EmpathySummaryModal.tsx';
import { MoodCheckIn, MoodOption } from './components/MoodCheckIn.tsx';
import { BreathingExerciseModal } from './components/BreathingExerciseModal.tsx';
import {
  ConversationMemoryModal,
  StoredMemory,
} from './components/ConversationMemoryModal.tsx';
import { HeartJournalView } from './components/HeartJournalView.tsx';
import { LettersView } from './components/LettersView.tsx';
import { LanguageSelectModal } from './components/LanguageSelectModal.tsx';
import { UserOnboardingModal } from './components/UserOnboardingModal.tsx';
import { MomlyAvatar } from './components/MomlyAvatar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { geminiCompanion } from './services/geminiVoiceCompanion.ts';
import { speechService } from './services/speechService.ts';
import { usageGuard, AuthUser } from './services/usageGuard.ts';
import { logoutFirebase } from './services/firebase.ts';
import { Language, translations } from './services/i18n.ts';
import { JournalEntry } from './types/journal.ts';

const extractNickname = (name?: string): string => {
  if (!name) return 'Mama';
  const clean = name.trim().replace(/^(mama|ibu|bunda)\s+/i, '').trim();
  const firstWord = clean.split(/\s+/)[0] || 'Mama';
  return firstWord;
};

export function App() {
  // Language state (default to English as requested)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('momly_lang');
    return (saved as Language) || 'en';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'breathe' | 'journal' | 'letters'>('home');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // User Profile Name State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('momly_user_name') || '';
  });
  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return usageGuard.getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

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
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Load user data whenever currentUser changes (prevents cross-user data leakage)
  useEffect(() => {
    if (!currentUser) {
      setMemories([]);
      setJournalEntries([]);
      setUserName('');
      return;
    }

    const userId = currentUser.id;

    // 1. Nickname
    try {
      const savedNick = localStorage.getItem(`momly_nickname_${userId}`);
      const nick = savedNick || extractNickname(currentUser.name);
      setUserName(nick);
      geminiCompanion.setUserName(nick);
    } catch (e) {
      console.warn('Failed to load nickname:', e);
    }

    // 2. Memories (User-scoped)
    try {
      let saved = localStorage.getItem(`momly_memories_${userId}`);
      if (!saved && currentUser.role === 'judge') {
        saved = localStorage.getItem('momly_memories');
      }
      if (saved) {
        setMemories(JSON.parse(saved));
      } else {
        setMemories([]);
      }
    } catch (e) {
      console.warn('Failed to load memories:', e);
      setMemories([]);
    }

    // 3. Heart Journal (User-scoped)
    try {
      let savedJournal = localStorage.getItem(`momly_heart_journal_${userId}`);
      if (!savedJournal && currentUser.role === 'judge') {
        savedJournal = localStorage.getItem('momly_heart_journal');
      }
      if (savedJournal) {
        setJournalEntries(JSON.parse(savedJournal));
      } else {
        setJournalEntries([]);
      }
    } catch (e) {
      console.warn('Failed to load journal entries:', e);
      setJournalEntries([]);
    }
  }, [currentUser?.id]);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    const savedNick = localStorage.getItem(`momly_nickname_${user.id}`);
    const nick = savedNick || extractNickname(user.name);
    setUserName(nick);
    geminiCompanion.setUserName(nick);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    usageGuard.logout();
    logoutFirebase();
    setCurrentUser(null);
    setUserName('');
    setMemories([]);
    setJournalEntries([]);
    setSelectedMood(null);
    localStorage.removeItem('momly_user_name');
    setShowAuthModal(false);
  };

  // Sync language & userName with services
  useEffect(() => {
    geminiCompanion.setLanguage(lang);
    if (userName) geminiCompanion.setUserName(userName);
    speechService.setLanguage(lang);
    localStorage.setItem('momly_lang', lang);
  }, [lang, userName]);

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => {
      const updated = [entry, ...prev];
      if (currentUser?.id) {
        try {
          localStorage.setItem(`momly_heart_journal_${currentUser.id}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save journal entry to localStorage:', e);
        }
      }
      return updated;
    });
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (currentUser?.id) {
        try {
          localStorage.setItem(`momly_heart_journal_${currentUser.id}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to update journal entries in localStorage:', e);
        }
      }
      return updated;
    });
  };

  const handleClearAllJournalEntries = () => {
    if (
      window.confirm(
        lang === 'id'
          ? 'Apakah Mama yakin ingin menghapus semua catatan jurnal?'
          : 'Are you sure you want to clear all journal entries?'
      )
    ) {
      setJournalEntries([]);
      if (currentUser?.id) {
        localStorage.removeItem(`momly_heart_journal_${currentUser.id}`);
      }
    }
  };

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    setSelectedMood(null); // Reset mood translation for current language
  };

  const handleSaveName = (name: string) => {
    const nick = extractNickname(name);
    setUserName(nick);
    if (currentUser?.id) {
      localStorage.setItem(`momly_nickname_${currentUser.id}`, nick);
    }
    localStorage.setItem('momly_user_name', nick);
    localStorage.setItem('momly_onboarding_shown', 'true');
    geminiCompanion.setUserName(nick);
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
      if (currentUser?.id) {
        try {
          localStorage.setItem(`momly_memories_${currentUser.id}`, JSON.stringify(updatedMemories));
        } catch (storageErr) {
          console.warn('Storage quota exceeded, unable to persist new memory:', storageErr);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleClearMemories = () => {
    setMemories([]);
    if (currentUser?.id) {
      localStorage.removeItem(`momly_memories_${currentUser.id}`);
    }
  };

  const t = translations[lang];

  // Landing Page Gate: if not authenticated, show welcoming Landing Page and showcase
  if (!currentUser) {
    return (
      <>
        <LandingPage
          lang={lang}
          onSelectLang={handleSelectLang}
          onOpenAuth={() => setShowAuthModal(true)}
          onDemoJudge={() => {
            const judgeUser = usageGuard.loginAsJudge();
            handleAuthSuccess(judgeUser);
          }}
        />

        <AuthModal
          isOpen={showAuthModal}
          currentUser={null}
          onSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
          lang={lang}
          onSelectLang={handleSelectLang}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4FA] sm:py-6 flex items-center justify-center font-sans antialiased text-[#1C1228]">
      {/* Mobile-First App Container Frame */}
      <div className="w-full max-w-md h-screen h-dvh sm:h-[844px] sm:max-h-[844px] bg-[#FDFCFF] sm:rounded-[40px] shadow-2xl sm:border sm:border-[#FDDDD8] overflow-hidden flex flex-col relative select-none">
        
        {/* Top Mobile App Header */}
        <header className="w-full border-b border-[#FDDDD8]/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <MomlyAvatar size="sm" pose="winking" />
            <img
              src="/assets/momly/logo.png"
              alt="Momly - Your AI bestie, always here"
              className="h-7 sm:h-8 w-auto object-contain shrink-0"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* User Profile / Nickname Pill */}
            <button
              onClick={() => setShowNameModal(true)}
              className={`inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs max-w-[130px] sm:max-w-none ${
                currentUser?.role === 'judge'
                  ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-300/40'
                  : 'border-[#FDDDD8] bg-[#FFF8F2] hover:bg-[#FDDDD8]/50 text-[#1C1228]'
              }`}
              title={
                currentUser?.role === 'judge'
                  ? (lang === 'id' ? 'Akses Juri AI Builder Cup' : 'AI Builder Cup Judge Pass')
                  : (lang === 'id' ? 'Ketuk untuk ganti nama panggilan Mama' : 'Tap to change your nickname')
              }
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt=""
                  className="w-4 h-4 rounded-full shrink-0 object-cover border border-slate-200"
                />
              ) : (
                <span className="text-[10px] shrink-0">{currentUser?.role === 'judge' ? '⭐' : '👤'}</span>
              )}
              <span className="font-bold text-[10px] sm:text-[11px] truncate">
                {currentUser?.role === 'judge'
                  ? (lang === 'id' ? 'Mode Juri' : 'Judge Mode')
                  : (userName ? `Mama ${userName}` : 'Mama')}
              </span>
              <Edit3 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>

            {/* Direct Log Out Button */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
                title={lang === 'id' ? 'Keluar dari Akun (Log Out)' : 'Log Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline ml-1">
                  {lang === 'id' ? 'Keluar' : 'Logout'}
                </span>
              </button>
            )}

            {/* Language Switcher Pill */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-[#FDDDD8] bg-[#FDDDD8]/40 hover:bg-[#FDDDD8]/70 text-[10px] sm:text-[11px] font-semibold text-[#F07B6B] transition-all cursor-pointer shadow-2xs shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="uppercase font-bold tracking-tight">
                {lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}
              </span>
            </button>
          </div>
        </header>

        {/* Tab 1: Companion (Main Voice Screen) */}
        {activeTab === 'home' && (
          <main className="flex-1 px-4 py-5 flex flex-col items-center justify-between text-center overflow-y-auto pb-6">
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
          </main>
        )}

        {/* Tab 2: Breathe (Full-screen Mobile Breathing View) */}
        {activeTab === 'breathe' && (
          <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center text-center overflow-y-auto pb-6">
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

        {/* Tab 3: Journal (Heart Journal View - Gratitude & Micro-Wins) */}
        {activeTab === 'journal' && (
          <HeartJournalView
            entries={journalEntries}
            onAddEntry={handleAddJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            onClearAll={handleClearAllJournalEntries}
            lang={lang}
          />
        )}

        {/* Tab 4: Letters (Surat Cinta dari Momly - Post-Call Summaries) */}
        {activeTab === 'letters' && (
          <LettersView
            memories={memories}
            onClearMemories={handleClearMemories}
            lang={lang}
          />
        )}

        {/* Sticky Mobile App Bottom Navigation Bar (4 Clean Tabs: Curhat, Jeda, Jurnal, Surat) */}
        <nav className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-[#FDDDD8]/80 py-2 px-3 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(28,18,40,0.05)]">
          {/* Tab 1: Curhat (Home) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-3 py-1 rounded-xl ${
              activeTab === 'home'
                ? 'text-[#F07B6B] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageCircleHeart className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.bottomNav.home}</span>
          </button>

          {/* Tab 2: Jeda (Breathe) */}
          <button
            onClick={() => setActiveTab('breathe')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-3 py-1 rounded-xl ${
              activeTab === 'breathe'
                ? 'text-[#6B5FA0] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wind className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.bottomNav.breathe}</span>
          </button>

          {/* Tab 3: Jurnal (Gratitude & Wins) */}
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-3 py-1 rounded-xl relative ${
              activeTab === 'journal'
                ? 'text-[#F07B6B] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <BookHeart className="w-5 h-5" />
              {journalEntries.length > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#F07B6B] text-white text-[8px] flex items-center justify-center font-bold">
                  {journalEntries.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">{t.bottomNav.journal}</span>
          </button>

          {/* Tab 4: Surat (Love Letters from Call Memory) */}
          <button
            onClick={() => setActiveTab('letters')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-3 py-1 rounded-xl relative ${
              activeTab === 'letters'
                ? 'text-[#6B5FA0] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Mail className="w-5 h-5" />
              {memories.length > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#6B5FA0] text-white text-[8px] flex items-center justify-center font-bold">
                  {memories.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">{t.bottomNav.letters}</span>
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
          currentUser={currentUser}
          onSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
          lang={lang}
          onSelectLang={handleSelectLang}
        />
      </div>
    </div>
  );
}

export default App;
