import { useState } from 'react';
import { Phone, Heart, Shield, Sparkles, Key, CheckCircle, Info } from 'lucide-react';
import { CallScreen } from './components/CallScreen.tsx';
import { EmpathySummaryModal } from './components/EmpathySummaryModal.tsx';
import { geminiCompanion } from './services/geminiVoiceCompanion.ts';

export function App() {
  const [isCalling, setIsCalling] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    headline: string;
    message: string;
    sentimentTag: string;
    tips: string[];
  } | null>(null);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const startCall = () => {
    geminiCompanion.resetConversation();
    setIsCalling(true);
  };

  const endCall = async () => {
    setIsCalling(false);
    setIsSummarizing(true);
    try {
      const summary = await geminiCompanion.generateEmpathySummary();
      setSummaryData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      geminiCompanion.setApiKey(customApiKey.trim());
      setKeySaved(true);
      setTimeout(() => {
        setKeySaved(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/70 via-white to-pink-50/40 text-slate-800">
      {/* Top Navbar */}
      <header className="w-full border-b border-rose-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">🌸</span>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                SUPER MAMA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                AI Voice Sanctuary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-rose-500" />
              <span>{geminiCompanion.hasApiKey() ? 'API Key Aktif' : 'Set API Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Google Cloud AI Builder Cup 2026 Project</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-2xl mb-4">
          Curhat Tanpa Beban, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Didengarkan Tanpa Dihakimi.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-xl mb-10 leading-relaxed">
          Lelah menggendong anak atau merasa sendirian di tengah malam? Tidak perlu repot mengetik. Cukup tekan tombol telepon, <strong>Bunda Rina</strong> siap mendengarkan suaramu dengan hangat.
        </p>

        {/* Big Call Trigger Button */}
        <div className="relative flex flex-col items-center mb-12">
          {/* Pulsing ring background */}
          <div className="absolute -inset-4 rounded-full bg-rose-400/20 blur-xl animate-pulse pointer-events-none" />

          <button
            onClick={startCall}
            className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 hover:scale-105 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-400/50 transition-all border-4 border-white"
          >
            <Phone className="w-9 h-9 sm:w-11 sm:h-11 animate-bounce" />
          </button>

          <span className="mt-4 text-xs sm:text-sm font-semibold text-rose-600 tracking-wide">
            Ketuk untuk Menelepon Bunda Rina
          </span>
          <span className="text-[11px] text-slate-400">
            Gratis 10 Menit Setiap Hari • 100% Suara Nyata & Empatik
          </span>
        </div>

        {/* 3 Pillar Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left mt-6">
          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Hands-Free (Suara Penuh)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ibu yang sedang menyusui atau menggendong bayi tak perlu menyentuh keyboard. Cukup berbicara santai.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">100% Anonim & Privat</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tanpa perlu daftar akun atau nomor HP. Ruang aman tanpa risiko dihakimi (*zero judgment sanctuary*).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Google Gemini 1.5 Flash</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kecerdasan emosional tinggi yang memahami dialek, empati, dan dinamika kelelahan ibu Indonesia.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-rose-100/60 py-6 text-center text-xs text-slate-400 bg-white/50">
        <p>© 2026 Super Mama. Built for Google Cloud AI Builder Cup 2026 (Hack2skill).</p>
      </footer>

      {/* Active Call Screen Overlay */}
      {isCalling && <CallScreen onEndCall={endCall} />}

      {/* Summarizing loader */}
      {isSummarizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 text-center space-y-3 max-w-xs shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Bunda Rina sedang menuliskan Surat Cinta untukmu...
            </p>
          </div>
        </div>
      )}

      {/* Empathy Summary Modal */}
      {summaryData && (
        <EmpathySummaryModal
          summary={summaryData}
          onClose={() => setSummaryData(null)}
        />
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-800 text-lg">Pengaturan Google Gemini Key</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Secara default, Super Mama menggunakan mode demo atau env key. Anda juga bisa memasukkan API Key Gemini pribadi Anda untuk testing mandiri.
            </p>

            <input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 mb-4"
            />

            <div className="flex items-center gap-2 mb-6 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Dapatkan key gratis di <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-rose-600 underline">Google AI Studio</a>.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={handleSaveApiKey}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-all"
              >
                {keySaved ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <span>Simpan API Key</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
