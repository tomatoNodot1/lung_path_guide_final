import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

type Completed = { g1: boolean; g2: boolean; g3: boolean };

type ActionLog = { action: string; timestamp: number };

type Ctx = {
  userId: string | null;
  sessionId: string | null;
  setUserId: (id: string) => Promise<void>;
  logout: () => void;
  completed: Completed;
  markCompleted: (n: 1 | 2 | 3) => Promise<void>;
  resetProgress: () => Promise<void>;
  logAction: (action: string) => Promise<void>;
  muted: boolean;
  toggleMuted: () => void;
  hydrated: boolean;
};

const GameStateContext = createContext<Ctx | null>(null);

const LS = {
  userId: "userId",
  sessionId: "sessionId",
  g1: "game1_completed",
  g2: "game2_completed",
  g3: "game3_completed",
  muted: "muted",
};

function readBool(k: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(k) === "true";
}

// Module-level merge baselines. Only one session is active per browser tab.
const sessionCache: { answers: Record<string, unknown>; actions_log: ActionLog[] } = {
  answers: {},
  actions_log: [],
};

function resetSessionCache() {
  sessionCache.answers = {};
  sessionCache.actions_log = [];
}

const sessionLSKey = (sid: string) => `sessionData_${sid}`;

function loadSessionCache(sid: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(sessionLSKey(sid));
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      answers?: Record<string, unknown>;
      actions_log?: ActionLog[];
    };
    sessionCache.answers = parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {};
    sessionCache.actions_log = Array.isArray(parsed.actions_log) ? parsed.actions_log : [];
  } catch (e) {
    console.warn("[gameState] failed to restore sessionCache", e);
  }
}

function persistSessionCache(sid: string | null) {
  if (!sid || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      sessionLSKey(sid),
      JSON.stringify({ answers: sessionCache.answers, actions_log: sessionCache.actions_log }),
    );
  } catch (e) {
    console.warn("[gameState] failed to persist sessionCache", e);
  }
}

function clearSessionCache(sid: string | null) {
  if (sid && typeof window !== "undefined") {
    window.localStorage.removeItem(sessionLSKey(sid));
  }
  resetSessionCache();
}

export async function upsertSession(
  sessionId: string | null,
  userId: string | null,
  patch: Record<string, unknown>,
) {
  if (!sessionId || !userId) return;
  const row: Record<string, unknown> = { session_id: sessionId, user_id: userId };
  let cacheTouched = false;
  for (const [k, v] of Object.entries(patch)) {
    if (k === "session_start_time" || k === "updated_at") continue; // never send
    if (k === "answers" && v && typeof v === "object") {
      // true deep merge: never let later modules wipe earlier ones
      sessionCache.answers = { ...sessionCache.answers, ...(v as Record<string, unknown>) };
      row.answers = sessionCache.answers;
      cacheTouched = true;
    } else if (k === "actions_log") {
      sessionCache.actions_log = Array.isArray(v) ? (v as ActionLog[]) : sessionCache.actions_log;
      row.actions_log = v;
      cacheTouched = true;
    } else {
      row[k] = v;
    }
  }
  if (cacheTouched) persistSessionCache(sessionId);
  try {
    await supabase.from("user_sessions").upsert(row, { onConflict: "session_id" });
  } catch (e) {
    console.warn("[supabase] upsert failed (continuing offline)", e);
  }
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Completed>({ g1: false, g2: false, g3: false });
  const [muted, setMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const uid = window.localStorage.getItem(LS.userId);
    const sid = window.localStorage.getItem(LS.sessionId);
    setUserIdState(uid);
    setSessionIdState(sid);
    if (sid) loadSessionCache(sid);
    setCompleted({ g1: readBool(LS.g1), g2: readBool(LS.g2), g3: readBool(LS.g3) });
    setMuted(readBool(LS.muted));
    setHydrated(true);
  }, []);

  const setUserId = useCallback(async (id: string) => {
    const newSession = `${id}_${Date.now()}`;
    const prevSid = window.localStorage.getItem(LS.sessionId);
    clearSessionCache(prevSid);
    window.localStorage.setItem(LS.userId, id);
    window.localStorage.setItem(LS.sessionId, newSession);
    // fresh session: clear completion flags from any prior playthrough
    [LS.g1, LS.g2, LS.g3].forEach((k) => window.localStorage.removeItem(k));
    setUserIdState(id);
    setSessionIdState(newSession);
    setCompleted({ g1: false, g2: false, g3: false });
    // insert a new row; rely on DB defaults for session_start_time / updated_at
    try {
      await supabase.from("user_sessions").insert({ session_id: newSession, user_id: id });
    } catch (e) {
      console.warn("[supabase] session insert failed (continuing offline)", e);
    }
  }, []);

  const logout = useCallback(() => {
    const prevSid = window.localStorage.getItem(LS.sessionId);
    clearSessionCache(prevSid);
    window.localStorage.removeItem(LS.userId);
    window.localStorage.removeItem(LS.sessionId);
    [LS.g1, LS.g2, LS.g3].forEach((k) => window.localStorage.removeItem(k));
    setUserIdState(null);
    setSessionIdState(null);
    setCompleted({ g1: false, g2: false, g3: false });
  }, []);

  const markCompleted = useCallback(
    async (n: 1 | 2 | 3) => {
      const key = n === 1 ? LS.g1 : n === 2 ? LS.g2 : LS.g3;
      window.localStorage.setItem(key, "true");
      setCompleted((c) => ({ ...c, [`g${n}` as const]: true }));
      await upsertSession(sessionId, userId, {
        [`game${n}_completed`]: true,
        current_progress: `module${n}_done`,
      });
    },
    [userId, sessionId],
  );

  const resetProgress = useCallback(async () => {
    [LS.g1, LS.g2, LS.g3].forEach((k) => window.localStorage.removeItem(k));
    setCompleted({ g1: false, g2: false, g3: false });
    await upsertSession(sessionId, userId, {
      game1_completed: false,
      game2_completed: false,
      game3_completed: false,
      current_progress: "reset",
    });
  }, [userId, sessionId]);

  const logAction = useCallback(
    async (action: string) => {
      const entry: ActionLog = { action, timestamp: Date.now() };
      // pure append, never dedupe
      sessionCache.actions_log = [...sessionCache.actions_log, entry];
      await upsertSession(sessionId, userId, { actions_log: sessionCache.actions_log });
    },
    [sessionId, userId],
  );

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      window.localStorage.setItem(LS.muted, String(next));
      return next;
    });
  }, []);

  return (
    <GameStateContext.Provider
      value={{
        userId,
        sessionId,
        setUserId,
        logout,
        completed,
        markCompleted,
        resetProgress,
        logAction,
        muted,
        toggleMuted,
        hydrated,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used inside GameStateProvider");
  return ctx;
}