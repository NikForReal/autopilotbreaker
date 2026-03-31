import { useState, useEffect, useCallback } from "react";

export interface SessionRecord {
  id: string;
  date: string;
  totalSeconds: number;
  distractions: { habit: number; bored: number; intentional: number };
}

const STORAGE_KEY = "autopilot-breaker-sessions";

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: SessionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessionStorage() {
  const [sessions, setSessions] = useState<SessionRecord[]>(loadSessions);

  const addSession = useCallback(
    (totalSeconds: number, distractions: { habit: number; bored: number; intentional: number }) => {
      if (totalSeconds < 5) return; // skip tiny sessions
      const record: SessionRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        totalSeconds,
        distractions,
      };
      setSessions((prev) => {
        const updated = [...prev, record];
        saveSessions(updated);
        return updated;
      });
    },
    [],
  );

  const clearSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { sessions, addSession, clearSessions };
}
