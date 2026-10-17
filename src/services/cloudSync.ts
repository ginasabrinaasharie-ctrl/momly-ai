import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { app } from './firebase.ts';

export interface UserCloudData {
  nickname?: string;
  memories?: any[];
  journalEntries?: any[];
  updatedAt?: string;
}

class CloudSyncService {
  private db: Firestore | null = null;
  private isFirestoreAvailable: boolean = true;

  constructor() {
    try {
      this.db = getFirestore(app);
    } catch (e) {
      console.warn('Firestore initialization notice:', e);
      this.isFirestoreAvailable = false;
    }
  }

  /**
   * Fetch cloud data for user, with automatic local-first fallback and remote reconciliation.
   */
  public async loadUserData(userId: string): Promise<UserCloudData> {
    // 1. Read local cache first (Instant UI response)
    const localData: UserCloudData = {
      nickname: '',
      memories: [],
      journalEntries: [],
    };

    try {
      const savedNick = localStorage.getItem(`momly_nickname_${userId}`);
      if (savedNick) localData.nickname = savedNick;

      const savedMemories = localStorage.getItem(`momly_memories_${userId}`);
      if (savedMemories) localData.memories = JSON.parse(savedMemories);

      const savedJournals = localStorage.getItem(`momly_heart_journal_${userId}`);
      if (savedJournals) localData.journalEntries = JSON.parse(savedJournals);
    } catch (e) {
      console.warn('Local cache read error:', e);
    }

    // If Firestore is not available, return local data immediately
    if (!this.db || !this.isFirestoreAvailable || !userId) {
      return localData;
    }

    // 2. Attempt remote Firestore hydration
    try {
      const userDocRef = doc(this.db, 'users', userId);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const remote = snapshot.data() as UserCloudData;

        // Reconcile / Merge remote memories
        let mergedMemories = localData.memories || [];
        if (remote.memories && Array.isArray(remote.memories)) {
          if (mergedMemories.length === 0) {
            mergedMemories = remote.memories;
          } else {
            // Merge deduplicated by id or text
            const seen = new Set(mergedMemories.map((m: any) => m.id || m.text));
            for (const r of remote.memories) {
              const key = r.id || r.text;
              if (!seen.has(key)) {
                mergedMemories.push(r);
                seen.add(key);
              }
            }
          }
        }

        // Reconcile / Merge remote journal entries
        let mergedJournals = localData.journalEntries || [];
        if (remote.journalEntries && Array.isArray(remote.journalEntries)) {
          if (mergedJournals.length === 0) {
            mergedJournals = remote.journalEntries;
          } else {
            // Merge deduplicated by id
            const seen = new Set(mergedJournals.map((j: any) => j.id));
            for (const r of remote.journalEntries) {
              if (r.id && !seen.has(r.id)) {
                mergedJournals.push(r);
                seen.add(r.id);
              }
            }
            // Sort by timestamp descending
            mergedJournals.sort((a: any, b: any) => {
              const dateA = new Date(a.date || 0).getTime();
              const dateB = new Date(b.date || 0).getTime();
              return dateB - dateA;
            });
          }
        }

        const reconciledNickname = remote.nickname || localData.nickname || '';

        // Hydrate local cache with fresh merged data
        try {
          if (reconciledNickname) {
            localStorage.setItem(`momly_nickname_${userId}`, reconciledNickname);
          }
          localStorage.setItem(`momly_memories_${userId}`, JSON.stringify(mergedMemories));
          localStorage.setItem(`momly_heart_journal_${userId}`, JSON.stringify(mergedJournals));
        } catch (e) {
          console.warn('Failed to update local cache during cloud hydration:', e);
        }

        return {
          nickname: reconciledNickname,
          memories: mergedMemories,
          journalEntries: mergedJournals,
          updatedAt: remote.updatedAt,
        };
      }
    } catch (err: any) {
      // Graceful offline degradation if Firestore is not yet enabled or network drops
      console.info('Cloud sync notice (using offline local data):', err?.message || err);
    }

    return localData;
  }

  /**
   * Save user data locally and opportunistically push to Firestore.
   */
  public async saveUserData(userId: string, data: Partial<UserCloudData>): Promise<void> {
    if (!userId) return;

    // 1. Instant local persistence
    try {
      if (data.nickname !== undefined) {
        localStorage.setItem(`momly_nickname_${userId}`, data.nickname);
      }
      if (data.memories !== undefined) {
        localStorage.setItem(`momly_memories_${userId}`, JSON.stringify(data.memories));
      }
      if (data.journalEntries !== undefined) {
        localStorage.setItem(`momly_heart_journal_${userId}`, JSON.stringify(data.journalEntries));
      }
    } catch (e) {
      console.warn('Failed to save to local cache:', e);
    }

    // 2. Push to Cloud Firestore if available
    if (!this.db || !this.isFirestoreAvailable) return;

    try {
      const userDocRef = doc(this.db, 'users', userId);
      const payload: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.nickname !== undefined) payload.nickname = data.nickname;
      if (data.memories !== undefined) payload.memories = data.memories;
      if (data.journalEntries !== undefined) payload.journalEntries = data.journalEntries;

      await setDoc(userDocRef, payload, { merge: true });
    } catch (err: any) {
      // Non-blocking log if Firestore is disabled or unreachable
      console.info('Cloud push notice (persisted locally):', err?.message || err);
    }
  }
}

export const cloudSync = new CloudSyncService();
