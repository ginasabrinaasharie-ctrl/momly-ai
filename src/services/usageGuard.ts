// Usage Guard & Demo Access Control for Momly (Google Cloud AI Builder Cup 2026)

export interface AuthUser {
  id: string;
  name: string;
  role: 'judge' | 'mama';
  email?: string;
  authProvider: 'demo_bypass' | 'google' | 'guest';
}

export interface UsageStatus {
  usedTurns: number;
  maxTurns: number;
  remainingTurns: number;
  isLimitReached: boolean;
}

class UsageGuardService {
  private readonly USER_STORAGE_KEY = 'momly_auth_user';
  private readonly USAGE_STORAGE_KEY = 'momly_usage_tracker';

  private getTodayKey(): string {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  public getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth user:', e);
    }
    return null;
  }

  public isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  public loginAsJudge(customName: string = 'Juri AI Builder Cup'): AuthUser {
    const judgeUser: AuthUser = {
      id: `judge-${Date.now()}`,
      name: customName.trim() || 'Juri AI Builder Cup',
      role: 'judge',
      authProvider: 'demo_bypass',
    };
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(judgeUser));
    localStorage.setItem('momly_user_name', judgeUser.name);
    return judgeUser;
  }

  public loginAsMama(name: string, email?: string): AuthUser {
    const cleanName = name.trim() || 'Mama';
    const mamaUser: AuthUser = {
      id: `mama-${Date.now()}`,
      name: cleanName,
      role: 'mama',
      email: email?.trim(),
      authProvider: email ? 'google' : 'guest',
    };
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(mamaUser));
    localStorage.setItem('momly_user_name', cleanName);
    return mamaUser;
  }

  public logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  private getMaxTurnsForRole(role: 'judge' | 'mama'): number {
    // Generous quota: 25 turns for judges, 50 turns for registered mamas
    return role === 'judge' ? 25 : 50;
  }

  public getUsageStatus(): UsageStatus {
    const user = this.getCurrentUser();
    const maxTurns = user ? this.getMaxTurnsForRole(user.role) : 25;
    const today = this.getTodayKey();

    try {
      const usageRaw = localStorage.getItem(this.USAGE_STORAGE_KEY);
      if (usageRaw) {
        const usageData = JSON.parse(usageRaw);
        if (usageData.date === today) {
          const used = usageData.count || 0;
          return {
            usedTurns: used,
            maxTurns,
            remainingTurns: Math.max(0, maxTurns - used),
            isLimitReached: used >= maxTurns,
          };
        }
      }
    } catch (e) {
      console.warn('Error reading usage status:', e);
    }

    return {
      usedTurns: 0,
      maxTurns,
      remainingTurns: maxTurns,
      isLimitReached: false,
    };
  }

  public consumeTurn(): { allowed: boolean; remainingTurns: number } {
    const status = this.getUsageStatus();
    if (status.isLimitReached) {
      return { allowed: false, remainingTurns: 0 };
    }

    const today = this.getTodayKey();
    const newCount = status.usedTurns + 1;

    try {
      localStorage.setItem(
        this.USAGE_STORAGE_KEY,
        JSON.stringify({ date: today, count: newCount })
      );
    } catch (e) {
      console.warn('Error saving usage count:', e);
    }

    const remaining = Math.max(0, status.maxTurns - newCount);
    return {
      allowed: true,
      remainingTurns: remaining,
    };
  }
}

export const usageGuard = new UsageGuardService();
