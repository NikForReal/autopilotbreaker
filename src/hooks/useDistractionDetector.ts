import { useEffect, useRef, useCallback } from "react";

type DetectionSource = "tab_switch" | "inactivity" | "random_check";

interface UseDistractionDetectorOptions {
  enabled: boolean;
  inactivityTimeout?: number;
  randomCheckMin?: number;
  randomCheckMax?: number;
  tabSwitchDelay?: number;
  popupCooldown?: number;
  onDetected: (source: DetectionSource) => void;
  onDistractionStart?: () => void;
  onDistractionEnd?: () => void;
}

const useDistractionDetector = ({
  enabled,
  inactivityTimeout = 15,
  randomCheckMin = 30,
  randomCheckMax = 60,
  tabSwitchDelay = 2.5,
  popupCooldown = 10,
  onDetected,
  onDistractionStart,
  onDistractionEnd,
}: UseDistractionDetectorOptions) => {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const randomCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabSwitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDialogOpen = useRef(false);
  const isDistracted = useRef(false);
  const lastPopupTime = useRef(0);
  const tabHiddenAt = useRef<number | null>(null);
  const isInactive = useRef(false);

  const canShowPopup = useCallback(() => {
    if (isDialogOpen.current) return false;
    const now = Date.now();
    if (now - lastPopupTime.current < popupCooldown * 1000) return false;
    return true;
  }, [popupCooldown]);

  const triggerDetection = useCallback((source: DetectionSource) => {
    if (!canShowPopup()) return;
    lastPopupTime.current = Date.now();
    onDetected(source);
  }, [canShowPopup, onDetected]);

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

  // Tab visibility detection with delay
  useEffect(() => {
    if (!enabled) return;

    const handler = () => {
      if (document.hidden) {
        tabHiddenAt.current = Date.now();
        // Start a delayed check — only trigger if tab stays hidden
        tabSwitchTimer.current = setTimeout(() => {
          if (document.hidden) {
            if (!isDistracted.current) {
              isDistracted.current = true;
              onDistractionStart?.();
            }
          }
        }, tabSwitchDelay * 1000);
      } else {
        // Tab became visible again
        const hiddenDuration = tabHiddenAt.current ? (Date.now() - tabHiddenAt.current) / 1000 : 0;
        tabHiddenAt.current = null;

        // Clear pending delayed trigger
        if (tabSwitchTimer.current) {
          clearTimeout(tabSwitchTimer.current);
          tabSwitchTimer.current = null;
        }

        // Only count as distraction if tab was hidden long enough
        if (hiddenDuration >= tabSwitchDelay) {
          triggerDetection("tab_switch");
        } else if (isDistracted.current) {
          // Short switch — just end distraction silently
          isDistracted.current = false;
          onDistractionEnd?.();
        }
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      if (tabSwitchTimer.current) clearTimeout(tabSwitchTimer.current);
    };
  }, [enabled, tabSwitchDelay, triggerDetection, onDistractionStart, onDistractionEnd]);

  // Inactivity detection — combined with tab state
  useEffect(() => {
    if (!enabled) return;

    const resetInactivity = () => {
      isInactive.current = false;
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        isInactive.current = true;
        // Only trigger if user is actually inactive (combined signal)
        if (!isDistracted.current) {
          isDistracted.current = true;
          onDistractionStart?.();
        }
        triggerDetection("inactivity");
      }, inactivityTimeout * 1000);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    resetInactivity();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [enabled, inactivityTimeout, triggerDetection, onDistractionStart]);

  // Random timed checks
  useEffect(() => {
    if (!enabled) return;

    const scheduleNext = () => {
      const delay = (randomCheckMin + Math.random() * (randomCheckMax - randomCheckMin)) * 1000;
      randomCheckTimer.current = setTimeout(() => {
        triggerDetection("random_check");
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (randomCheckTimer.current) clearTimeout(randomCheckTimer.current);
    };
  }, [enabled, randomCheckMin, randomCheckMax, triggerDetection]);

  return { setDialogOpen };
};

export default useDistractionDetector;
