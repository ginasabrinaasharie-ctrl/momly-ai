export type JournalInputMethod = 'quick' | 'voice' | 'text';

export interface JournalEntry {
  id: string;
  createdAt: number;
  dateFormatted: string; // e.g. "Kamis, 15 Okt 2026"
  moodEmoji?: string;
  gratitude: string[]; // List of things grateful for
  microWins: string[]; // List of small wins / achievements
  aiValidationNote: string; // Momly's loving response note
  inputMethod: JournalInputMethod;
}

export interface JournalProcessingResult {
  gratitude: string[];
  microWins: string[];
  aiValidationNote: string;
}
