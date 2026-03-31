import { useEffect, useRef, useCallback, useState } from "react";

type DetectionSource = "tab_switch" | "inactivity" | "random_check";

interface UseDistractionDetectorOptions {
  enabled: boolean;
  inactivityTimeout?: number;
  randomCheckMin?: number;
  randomCheckMax?: number;
  onDetected: (source: DetectionSource) => void;
  onDistractionStart?: () => void;
  onDistractionEnd?: () => void;
}

const useDistractionDetector = ({
  enabled,
  inactivityTimeout = 15,
  randomCheckMin = 30,
  randomCheckMax = 60,
  onDetected,
  onDistractionStart,
  onDistractionEnd,
}: UseDistractionDetectorOptions) => {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const randomCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDialogOpen = useRef(false);
  const isDistracted = useRef(false);

  const setDialogOpen = useCallback((open: boolean) => {
    isDialogOpen.current = open;
    if (open && !isDistracted.current) {
      isDistracted.current = true;
      onDistractionStart?.();
    }
    if (!open && isDistracted.current) {
      isDistracted.current = false;
      onDistractionEnd?.();
    }
  }, [onDistractionStart, onDistractionEnd]);

  // Tab visibility detection
  useEffect(() => {
    if (!enabled) return;

    let wasHidden = false;
    const handler = () => {
      if (document.hidden) {
        wasHidden = true;
        if (!isDistracted.current) {
          isDistracted.current = true;
          onDistractionStart?.();
        }
      } else if (wasHidden) {
        wasHidden = false;
        if (!isDialogOpen.current) {
          onDetected("tab_switch");
        }
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [enabled, onDetected, onDistractionStart]);

  // Inactivity detection
  useEffect(() => {
    if (!enabled) return;

    const resetInactivity = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        if (!isDialogOpen.current) {
          if (!isDistracted.current) {
            isDistracted.current = true;
            onDistractionStart?.();
          }
          onDetected("inactivity");
        }
      }, inactivityTimeout * 1000);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    resetInactivity();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [enabled, inactivityTimeout, onDetected, onDistractionStart]);

  // Random timed checks
  useEffect(() => {
    if (!enabled) return;

    const scheduleNext = () => {
      const delay = (randomCheckMin + Math.random() * (randomCheckMax - randomCheckMin)) * 1000;
      randomCheckTimer.current = setTimeout(() => {
        if (!isDialogOpen.current) {
          onDetected("random_check");
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (randomCheckTimer.current) clearTimeout(randomCheckTimer.current);
    };
  }, [enabled, randomCheckMin, randomCheckMax, onDetected]);

  return { setDialogOpen };
};

export default useDistractionDetector;
