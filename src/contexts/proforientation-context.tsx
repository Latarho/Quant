"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  OrientationScores,
  ProforientationApplication,
  ProforientationStatus,
} from "@/lib/proforientation/types";
import { DEFAULT_ORIENTATION_TEST_RESULTS_PDF } from "@/lib/proforientation/types";
import { buildRecommendations } from "@/lib/proforientation/recommendations";
import {
  DEMO_SEED_APPLICATION_IDS,
  getSeedProforientationApplications,
  PROFORIENTATION_SEED_CONTENT_VERSION,
  shouldReplaceWithFullDemoSeed,
} from "@/lib/proforientation/mock-applications";

const STORAGE_KEY = "proforientation-applications-v12";
/** Версия содержимого демо-сида (см. PROFORIENTATION_SEED_CONTENT_VERSION) */
const SEED_VERSION_KEY = "proforientation-seed-content-version";

const LEGACY_STORAGE_KEYS = [
  "proforientation-applications-v11",
  "proforientation-applications-v10",
  "proforientation-applications-v8",
  "proforientation-applications-v7",
  "proforientation-applications-v6",
  "proforientation-applications-v5",
  "proforientation-applications-v1",
] as const;

function normalizeStatus(raw: unknown): ProforientationStatus {
  if (raw === "created" || raw === "in_progress" || raw === "completed") return raw;
  if (raw === "draft" || raw === "pending") return "created";
  if (raw === "referred" || raw === "in_procedure") return "in_progress";
  return "created";
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `po-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeOrientationTest(
  raw: unknown
): ProforientationApplication["orientationTest"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const s = o.status;
  if (s !== "pending_link" && s !== "awaiting_pass" && s !== "awaiting_results" && s !== "results_ready") {
    return undefined;
  }
  return {
    status: s,
    testUrl: typeof o.testUrl === "string" && o.testUrl.trim() ? o.testUrl.trim() : undefined,
    resultsPdfUrl:
      typeof o.resultsPdfUrl === "string" && o.resultsPdfUrl.trim() ? o.resultsPdfUrl.trim() : undefined,
  };
}

/** Удаляет заявки с недопустимым ФИО участника тестирования (локальные данные / импорт). */
function dropBlockedParticipantApplications(
  rows: ProforientationApplication[]
): ProforientationApplication[] {
  return rows.filter((a) => !/путин/i.test(a.childFullName ?? ""));
}

function coerceRow(raw: unknown): ProforientationApplication | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  const base = raw as ProforientationApplication;
  const orientationTest =
    r.orientationTest === undefined ? base.orientationTest : normalizeOrientationTest(r.orientationTest) ?? undefined;
  return {
    ...base,
    status: normalizeStatus(r.status),
    interestDirections: Array.isArray(r.interestDirections) ? (r.interestDirections as string[]) : [],
    comment: typeof r.comment === "string" ? r.comment : "",
    orientationTest,
  };
}

function markSeedVersionCurrent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEED_VERSION_KEY, String(PROFORIENTATION_SEED_CONTENT_VERSION));
}

function takeFreshSeed(): ProforientationApplication[] {
  const fresh = getSeedProforientationApplications();
  markSeedVersionCurrent();
  return fresh;
}

function loadFromStorage(): ProforientationApplication[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = window.localStorage.getItem(key);
        if (legacy) {
          raw = legacy;
          window.localStorage.setItem(STORAGE_KEY, legacy);
          break;
        }
      }
    }
    if (!raw) return takeFreshSeed();
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return takeFreshSeed();
    const rows = dropBlockedParticipantApplications(
      parsed.map(coerceRow).filter((x): x is ProforientationApplication => x !== null)
    );
    /** Пустой [] в storage (часто из‑за первого persist до hydrate) — подставляем демо-заявки */
    if (rows.length === 0 && parsed.length === 0) {
      return takeFreshSeed();
    }
    /** Все элементы распарсились в null — битый JSON */
    if (rows.length === 0 && parsed.length > 0) {
      return takeFreshSeed();
    }
    /** Осталась только часть демо-заявок (например один объект в массиве) — восстанавливаем полный сид */
    if (shouldReplaceWithFullDemoSeed(rows)) {
      const fresh = getSeedProforientationApplications();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      markSeedVersionCurrent();
      return fresh;
    }
    /** В хранилище только демо-заявки, но сид устарел относительно версии в коде — подменяем целиком */
    const onlyDemoIds =
      rows.length > 0 && rows.every((a) => DEMO_SEED_APPLICATION_IDS.has(a.id));
    const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY);
    if (
      onlyDemoIds &&
      storedVersion !== String(PROFORIENTATION_SEED_CONTENT_VERSION)
    ) {
      const fresh = getSeedProforientationApplications();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      markSeedVersionCurrent();
      return fresh;
    }
    return rows;
  } catch {
    return takeFreshSeed();
  }
}

interface ProforientationContextValue {
  applications: ProforientationApplication[];
  submitApplication: (data: Omit<ProforientationApplication, "id" | "createdAt" | "updatedAt" | "status">) => string;
  updateStatus: (id: string, status: ProforientationStatus, patch?: Partial<ProforientationApplication>) => void;
  setResult: (
    id: string,
    scores: OrientationScores,
    summary: string
  ) => void;
}

const ProforientationContext = createContext<ProforientationContextValue | null>(null);

export function ProforientationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<ProforientationApplication[]>([]);
  /** Не пишем в localStorage на первом прогоне эффекта с пустым [] — иначе затираем сид до loadFromStorage */
  const persistReadyRef = useRef(false);

  useEffect(() => {
    setApplications(loadFromStorage());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!persistReadyRef.current) {
      persistReadyRef.current = true;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const submitApplication = useCallback(
    (data: Omit<ProforientationApplication, "id" | "createdAt" | "updatedAt" | "status">) => {
      if (/путин/i.test(data.childFullName.trim())) {
        throw new Error("Нельзя создать заявку с таким ФИО участника тестирования.");
      }
      const now = new Date().toISOString();
      const id = newId();
      const row: ProforientationApplication = {
        ...data,
        id,
        status: "created",
        createdAt: now,
        updatedAt: now,
        orientationTest: data.orientationTest ?? { status: "pending_link" },
      };
      setApplications((prev) => [row, ...prev]);
      return id;
    },
    []
  );

  const updateStatus = useCallback(
    (id: string, status: ProforientationStatus, patch?: Partial<ProforientationApplication>) => {
      setApplications((prev) =>
        dropBlockedParticipantApplications(
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...patch,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : a
          )
        )
      );
    },
    []
  );

  const setResult = useCallback((id: string, scores: OrientationScores, summary: string) => {
    const recommendations = buildRecommendations(scores);
    const completedAt = new Date().toISOString();
    setApplications((prev) =>
      dropBlockedParticipantApplications(
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "completed",
                updatedAt: completedAt,
                result: {
                  completedAt,
                  scores,
                  summary,
                  recommendations,
                },
                orientationTest: {
                  status: "results_ready",
                  testUrl: a.orientationTest?.testUrl,
                  resultsPdfUrl: a.orientationTest?.resultsPdfUrl ?? DEFAULT_ORIENTATION_TEST_RESULTS_PDF,
                },
              }
            : a
        )
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      applications,
      submitApplication,
      updateStatus,
      setResult,
    }),
    [applications, submitApplication, updateStatus, setResult]
  );

  return (
    <ProforientationContext.Provider value={value}>{children}</ProforientationContext.Provider>
  );
}

export function useProforientation() {
  const ctx = useContext(ProforientationContext);
  if (!ctx) {
    throw new Error("useProforientation must be used within ProforientationProvider");
  }
  return ctx;
}
