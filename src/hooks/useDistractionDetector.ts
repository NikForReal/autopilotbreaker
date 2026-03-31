import { useEffect, useRef, useCallback } from "react";

type DetectionSource = "inactivity";

interface UseDistractionDetectorOptions {
  enabled: boolean;
  inactivityTimeout?: number;
  popupCooldown?: number;
  onDetected: (source: DetectionSource) => void;
  onDistractionStart?: () => void;
  onDistractionEnd?: () => void;
}

const useDistractionDetector = ({
  enabled,
  inactivityTimeout = 10,
  popupCooldown = 15,
  onDetected,
  onDistractionStart,
  onDistractionEnd,
}: UseDistractionDetectorOptions) => {
  const idleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDialogOpen = useRef(false);
  const isDistracted = useRef(false);
  const lastPopupTime = useRef(0);
  const idleSeconds = useRef(0);
  const hasTriggeredForCurrentIdle = useRef(false);

  const startDistraction = useCallback(() => {
    if (!isDistracted.current) {
      isDistracted.current = true;
      onDistractionStart?.();
    }
  }, [onDistractionStart]);

  const endDistraction = useCallback(() => {
    if (isDistracted.current) {
      isDistracted.current = false;
      onDistractionEnd?.();
    }
  }, [onDistractionEnd]);

  const canShowPopup = useCallback(() => {
    if (isDialogOpen.current) return false;
    const now = Date.now();
    if (now - lastPopupTime.current < popupCooldown * 1000) return false;
    return true;
  }, [popupCooldown]);

  const triggerDetection = useCallback((source: DetectionSource) => {
    if (!canShowPopup()) return;
    lastPopupTime.current = Date.now();
    idleSeconds.current = 0;
    hasTriggeredForCurrentIdle.current = true;
    startDistraction();
    onDetected(source);
  }, [canShowPopup, onDetected, startDistraction]);

  const setDialogOpen = useCallback((open: boolean) => {
    isDialogOpen.current = open;
    if (open) {
      startDistraction();
      return;
    }

    endDistraction();
  }, [endDistraction, startDistraction]);

  useEffect(() => {
    if (!enabled) {
      idleSeconds.current = 0;
      hasTriggeredForCurrentIdle.current = false;
      endDistraction();
      if (idleInterval.current) {
        clearInterval(idleInterval.current);
        idleInterval.current = null;
      }
      return;
    }

    const resetIdle = () => {
      idleSeconds.current = 0;
      hasTriggeredForCurrentIdle.current = false;

      if (!isDialogOpen.current) {
        endDistraction();
      }
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdle));

    idleInterval.current = setInterval(() => {
      idleSeconds.current += 1;

      if (idleSeconds.current >= inactivityTimeout && !hasTriggeredForCurrentIdle.current) {
        triggerDetection("inactivity");
      }
    }, 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdle));
      if (idleInterval.current) {
        clearInterval(idleInterval.current);
        idleInterval.current = null;
      }
    };
  }, [enabled, inactivityTimeout, triggerDetection, endDistraction]);

  return { setDialogOpen };
};

export default useDistractionDetector;
