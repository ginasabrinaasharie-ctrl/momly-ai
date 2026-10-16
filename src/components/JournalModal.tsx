import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Heart,
  Loader2,
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { JournalEntry, JournalInputMethod } from '../types/journal.ts';
import { speechService } from '../services/speechService.ts';
import { geminiCompanion } from '../services/geminiVoiceCompanion.ts';
import { MomlyAvatar } from './MomlyAvatar.tsx';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: JournalEntry) => void;
  lang: Language;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  lang,
}) => {
  const t = translations[lang].journal;

  const [activeMode, setActiveMode] = useState<JournalInputMethod>('quick');
  const [selectedGratitudeChips, setSelectedGratitudeChips] = useState<string[]>([]);
  const [selectedWinsChips, setSelectedWinsChips] = useState<string[]>([]);
  const [customGratitude, setCustomGratitude] = useState('');
  const [customWins, setCustomWins] = useState('');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Loading & Result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedEntryPreview, setSavedEntryPreview] = useState<JournalEntry | null>(null);

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMode('quick');
      setSelectedGratitudeChips([]);
      setSelectedWinsChips([]);
      setCustomGratitude('');
      setCustomWins('');
      setVoiceTranscript('');
      setVoiceNotice('');
      setIsRecording(false);
      setIsTranscribing(false);
      setIsProcessing(false);
      setSavedEntryPreview(null);
    } else {
      if (isRecording) {
        speechService.stopListening();
        speechService.stopAudioRecording();
        setIsRecording(false);
        setIsTranscribing(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleGratitudeChip = (chip: string) => {
    setSelectedGratitudeChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const toggleWinChip = (chip: string) => {
    setSelectedWinsChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const startVoiceRecording = async () => {
    setVoiceTranscript('');
    setVoiceNotice('');
    setIsRecording(true);

    // Always start physical MediaRecorder (works across all browsers including Firefox & Safari)
    await speechService.startAudioRecording();

    if (isSpeechSupported) {
      speechService.startListening({
        onResult: (text) => {
          setVoiceTranscript(text);
        },
        onError: (err) => {
          console.warn('Voice recording SpeechRecognition notice:', err);
        },
        onEnd: () => {
          // Handled on manual stop or silence
        },
      });
    } else {
      setVoiceNotice(
        lang === 'id'
          ? '🎙️ Merekam suara Mama (Firefox)... Bicara santai ya, lalu klik tombol lagi saat selesai.'
          : '🎙️ Recording voice (Firefox)... Speak freely, then tap button when finished.'
      );
    }
  };

  const stopVoiceRecording = async () => {
    speechService.stopListening();
    setIsRecording(false);

    // Capture recorded audio bytes
    const audioData = await speechService.stopAudioRecording();

    // If Web Speech API didn't produce transcript (e.g. Firefox or mobile audio)
    if (!voiceTranscript.trim() && audioData && audioData.base64 && audioData.base64.length > 200) {
      setIsTranscribing(true);
      setVoiceNotice(
        lang === 'id'
          ? '✨ Sedang menyalin suara Mama ke teks...'
          : '✨ Transcribing your voice...'
      );
      try {
        const transcript = await geminiCompanion.transcribeAudio(
          audioData.base64,
          audioData.mimeType
        );
        if (transcript) {
          setVoiceTranscript(transcript);
          setVoiceNotice('');
        } else {
          setVoiceNotice(
            lang === 'id'
              ? 'Suara tidak terdengar jelas. Mama bisa coba bicara lebih dekat atau ketik manual.'
              : 'Voice was unclear. Please speak closer or type manually.'
          );
        }
      } catch (err) {
        console.warn('Audio transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);

    let rawText = '';
    let gratitudeList: string[] = [];
    let winsList: string[] = [];

    if (activeMode === 'quick') {
      gratitudeList = [...selectedGratitudeChips];
      if (customGratitude.trim()) gratitudeList.push(customGratitude.trim());
      winsList = [...selectedWinsChips];
      if (customWins.trim()) winsList.push(customWins.trim());
    } else if (activeMode === 'voice') {
      rawText = voiceTranscript.trim();
    } else {
      if (customGratitude.trim()) gratitudeList.push(customGratitude.trim());
      if (customWins.trim()) winsList.push(customWins.trim());
    }

    try {
      const result = await geminiCompanion.processJournalEntry({
        inputMethod: activeMode,
        rawText,
        gratitudeItems: gratitudeList,
        microWinItems: winsList,
      });

      const today = new Date();
      const dateFormatted = today.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        dateFormatted,
        moodEmoji: '🌸',
        gratitude: result.gratitude,
        microWins: result.microWins,
        aiValidationNote: result.aiValidationNote,
        inputMethod: activeMode,
      };

      onSaveEntry(newEntry);
      setSavedEntryPreview(newEntry);
    } catch (e) {
      console.error('Error saving journal:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const canSave = () => {
    if (activeMode === 'quick') {
      return (
        selectedGratitudeChips.length > 0 ||
        selectedWinsChips.length > 0 ||
        customGratitude.trim().length > 0 ||
        customWins.trim().length > 0
      );
    }
    if (activeMode === 'voice') {
      return voiceTranscript.trim().length > 3;
    }
    return customGratitude.trim().length > 0 || customWins.trim().length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#FDDDD8] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: Saved Entry Preview & Warm Validation Note */}
        {savedEntryPreview ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 overflow-y-auto">
            <MomlyAvatar size="lg" className="mx-auto" isSpeaking={false} />
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EEE8FF] text-[#6B5FA0] text-[10px] font-bold">
                {t.toastSaved}
              </span>
              <h3 className="text-base font-bold text-[#1C1228]">{t.aiNoteTitle}</h3>
            </div>

            <div className="w-full p-4 rounded-3xl bg-gradient-to-br from-[#FFF5F3] to-[#F8F5FF] border border-[#FDDDD8] text-xs text-[#1C1228] leading-relaxed shadow-xs relative">
              <span className="absolute -top-3 left-4 text-xl">💌</span>
              <p className="italic font-medium pt-1">
                "{savedEntryPreview.aiValidationNote}"
              </p>
            </div>

            {/* Quick Recap of Points */}
            <div className="w-full space-y-2 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              {savedEntryPreview.gratitude.length > 0 && (
                <div>
                  <span className="font-bold text-[#F07B6B] block mb-1">
                    🌻 {t.gratitudeSection}:
                  </span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                    {savedEntryPreview.gratitude.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {savedEntryPreview.microWins.length > 0 && (
                <div className="pt-1 border-t border-slate-200/60 mt-1">
                  <span className="font-bold text-[#6B5FA0] block mb-1">
                    🏆 {t.winsSection}:
                  </span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                    {savedEntryPreview.microWins.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#F07B6B]/25 transition-all cursor-pointer"
            >
              {lang === 'id' ? 'Terima Kasih Momly 🌸' : 'Thank You Momly 🌸'}
            </button>
          </div>
        ) : (
          /* State 2: Journal Input Mode */
          <>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3 pr-8">
              <div className="w-9 h-9 rounded-2xl bg-[#FDDDD8] text-[#F07B6B] flex items-center justify-center shrink-0 shadow-xs">
                📖
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1C1228]">
                  {t.modalTitle}
                </h3>
                <p className="text-[10px] text-[#8B7FA0] leading-tight">
                  {t.modalSubtitle}
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs (3 Modes) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F2FC] rounded-2xl mb-3">
              <button
                onClick={() => setActiveMode('quick')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeMode === 'quick'
                    ? 'bg-white text-[#F07B6B] font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <span>⚡</span>
                  <span>{t.modeQuickTitle}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">
                  {t.modeQuickBadge}
                </span>
              </button>

              <button
                onClick={() => setActiveMode('voice')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeMode === 'voice'
                    ? 'bg-white text-[#6B5FA0] font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <span>🎙️</span>
                  <span>{t.modeVoiceTitle}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">
                  {t.modeVoiceBadge}
                </span>
              </button>

              <button
                onClick={() => setActiveMode('text')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  activeMode === 'text'
                    ? 'bg-white text-[#F07B6B] font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <span>✍️</span>
                  <span>{t.modeTextTitle}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">
                  {t.modeTextBadge}
                </span>
              </button>
            </div>

            {/* Mode Description helper */}
            <p className="text-[10px] text-slate-500 italic mb-3 px-1 leading-snug">
              {activeMode === 'quick' && t.modeQuickDesc}
              {activeMode === 'voice' && t.modeVoiceDesc}
              {activeMode === 'text' && t.modeTextDesc}
            </p>

            {/* Body per Mode */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
              {/* MODE 1: Quick Tap Chips */}
              {activeMode === 'quick' && (
                <div className="space-y-3.5">
                  {/* Gratitude Chips */}
                  <div>
                    <label className="text-[11px] font-bold text-[#F07B6B] block mb-1.5">
                      {t.gratitudeLabel}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {t.quickGratitudeChips.map((chip) => {
                        const isSelected = selectedGratitudeChips.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleGratitudeChip(chip)}
                            className={`px-2.5 py-1.5 rounded-full text-[11px] transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F07B6B] text-white font-medium shadow-xs scale-102'
                                : 'bg-[#FFF0ED] text-slate-700 hover:bg-[#FDDDD8] border border-[#FDDDD8]'
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Micro-Wins Chips */}
                  <div>
                    <label className="text-[11px] font-bold text-[#6B5FA0] block mb-1.5">
                      {t.winsLabel}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {t.quickWinsChips.map((chip) => {
                        const isSelected = selectedWinsChips.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleWinChip(chip)}
                            className={`px-2.5 py-1.5 rounded-full text-[11px] transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#6B5FA0] text-white font-medium shadow-xs scale-102'
                                : 'bg-[#EEE8FF] text-slate-700 hover:bg-[#E3D8FF] border border-[#E3D8FF]'
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional short custom note */}
                  <div>
                    <input
                      type="text"
                      value={customGratitude}
                      onChange={(e) => setCustomGratitude(e.target.value)}
                      placeholder={lang === 'id' ? '+ Tambah catatan kecilmu sendiri...' : '+ Add your own little note...'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F07B6B] bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2: Voice Journaling */}
              {activeMode === 'voice' && (
                <div className="space-y-4 py-2 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <button
                      type="button"
                      disabled={isTranscribing}
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                        isTranscribing
                          ? 'bg-[#6B5FA0]/50 text-white cursor-wait'
                          : isRecording
                          ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-200'
                          : 'bg-gradient-to-r from-[#6B5FA0] to-[#8B7FA0] text-white hover:opacity-95 shadow-[#6B5FA0]/30'
                      }`}
                    >
                      {isTranscribing ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : isRecording ? (
                        <MicOff className="w-7 h-7" />
                      ) : (
                        <Mic className="w-7 h-7" />
                      )}
                    </button>

                    <p className="text-xs font-semibold text-slate-700">
                      {isTranscribing
                        ? (lang === 'id' ? 'Memproses rekaman suara Mama... ✨' : 'Transcribing voice with AI... ✨')
                        : isRecording
                        ? t.voiceRecording
                        : t.voiceTapToRecord}
                    </p>

                    {voiceNotice && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        {voiceNotice}
                      </p>
                    )}

                    {isRecording && (
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        {t.voiceStop}
                      </button>
                    )}
                  </div>

                  {/* Transcript box */}
                  <div className="w-full text-left p-3.5 rounded-2xl bg-[#F8F5FF] border border-[#EEE8FF] min-h-[90px] text-xs">
                    <p className="text-[10px] font-bold text-[#6B5FA0] uppercase tracking-wider mb-1">
                      {t.voiceSpokenNote}
                    </p>
                    {voiceTranscript ? (
                      <p className="text-slate-800 leading-relaxed italic">
                        "{voiceTranscript}"
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">
                        {lang === 'id'
                          ? 'Suaramu akan otomatis muncul di sini. Ceritakan apapun yang membuatmu tersenyum hari ini...'
                          : 'Your spoken words will appear here. Share anything that brought you warmth today...'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: Reflective Text Write */}
              {activeMode === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#F07B6B] block mb-1">
                      {t.gratitudeLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={customGratitude}
                      onChange={(e) => setCustomGratitude(e.target.value)}
                      placeholder={t.gratitudePlaceholder}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F07B6B] resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#6B5FA0] block mb-1">
                      {t.winsLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={customWins}
                      onChange={(e) => setCustomWins(e.target.value)}
                      placeholder={t.winsPlaceholder}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#6B5FA0] resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleSave}
              disabled={!canSave() || isProcessing}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                canSave() && !isProcessing
                  ? 'bg-gradient-to-r from-[#F07B6B] to-[#F5A898] text-white hover:opacity-95 shadow-[#F07B6B]/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.savingButton}</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{t.saveButton}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
