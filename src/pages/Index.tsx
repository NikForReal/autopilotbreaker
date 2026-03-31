import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Timer from "@/components/Timer";
import DistractionDialog from "@/components/DistractionDialog";
import StatsPanel from "@/components/StatsPanel";
import GenZMessage from "@/components/GenZMessage";
import FocusWarning from "@/components/FocusWarning";
import SessionSummary from "@/components/SessionSummary";
import useDistractionDetector from "@/hooks/useDistractionDetector";
import { useSessionStorage } from "@/hooks/useSessionStorage";

type DistractionReason = "habit" | "bored" | "intentional";

const Index = () => {
  const navigate = useNavigate();
  const { addSession } = useSessionStorage();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distractionTime, setDistractionTime] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detectionSource, setDetectionSource] = useState<string>("manual");
  const [distractions, setDistractions] = useState({ habit: 0, bored: 0, intentional: 0 });
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalSeconds: number;
    distractionSeconds: number;
    distractions: { habit: number; bored: number; intentional: number };
  } | null>(null);

  // Session timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Distraction timer
  useEffect(() => {
    if (!isRunning || !isDistracted) return;
    const interval = setInterval(() => setDistractionTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isDistracted]);

  const handleDistractionStart = useCallback(() => {
    setIsDistracted(true);
  }, []);

  const handleDistractionEnd = useCallback(() => {
    setIsDistracted(false);
  }, []);

  const handleAutoDetected = useCallback((source: string) => {
    setDetectionSource(source);
    setDialogOpen(true);
  }, []);

  const { setDialogOpen: setDetectorDialogOpen } = useDistractionDetector({
    enabled: isRunning,
    inactivityTimeout: 15,
    randomCheckMin: 30,
    randomCheckMax: 60,
    tabSwitchDelay: 2.5,
    popupCooldown: 10,
    onDetected: handleAutoDetected,
    onDistractionStart: handleDistractionStart,
    onDistractionEnd: handleDistractionEnd,
  });

  useEffect(() => {
    setDetectorDialogOpen(dialogOpen);
  }, [dialogOpen, setDetectorDialogOpen]);

  const handleDistraction = useCallback((reason: DistractionReason) => {
    setDistractions((prev) => ({ ...prev, [reason]: prev[reason] + 1 }));
    setTotalDistractions((t) => t + 1);
    setDialogOpen(false);
  }, []);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);

  const handleReset = () => {
    if (elapsed >= 5) {
      addSession(elapsed, distractionTime, distractions);
      setSummaryData({ totalSeconds: elapsed, distractionSeconds: distractionTime, distractions: { ...distractions } });
      setSummaryOpen(true);
    }
    setIsRunning(false);
    setElapsed(0);
    setDistractionTime(0);
    setIsDistracted(false);
    setDistractions({ habit: 0, bored: 0, intentional: 0 });
    setTotalDistractions(0);
  };

  const handleManualDistraction = () => {
    setDetectionSource("manual");
    setIsDistracted(true);
    setDialogOpen(true);
  };

  const total = distractions.habit + distractions.bored + distractions.intentional;
  const focusedTime = Math.max(0, elapsed - distractionTime);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow">
              <span className="text-primary font-bold text-sm">AP</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Auto Pilot <span className="text-primary">Breaker</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Smart Detection Active</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/analysis")}
              className="px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              📊 Analysis
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        <div className="text-center space-y-4">
          <Timer isRunning={isRunning} elapsedSeconds={elapsed} />

          {(isRunning || elapsed > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Focus:</span>
                <span className="font-mono text-sm text-primary font-bold">{formatTime(focusedTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Distracted:</span>
                <span className={`font-mono text-sm font-bold ${isDistracted ? "text-destructive animate-pulse" : "text-destructive/70"}`}>
                  {formatTime(distractionTime)}
                </span>
              </div>
            </motion.div>
          )}

          <FocusWarning distractionCount={totalDistractions} elapsedSeconds={elapsed} />
        </div>

        <div className="min-h-[48px] flex items-center justify-center">
          <GenZMessage triggerCount={totalDistractions} />
        </div>

        <div className="flex items-center gap-4">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg neon-glow-strong hover:brightness-110 transition-all"
            >
              {elapsed > 0 ? "Resume" : "Start Session"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg border border-border hover:bg-secondary/80 transition-all"
            >
              Pause
            </motion.button>
          )}

          {isRunning && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualDistraction}
              className="px-8 py-4 rounded-2xl bg-destructive/10 text-destructive font-bold text-lg border border-destructive/30 hover:bg-destructive/20 transition-all"
            >
              I got distracted 😵‍💫
            </motion.button>
          )}

          {elapsed > 0 && !isRunning && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-6 py-4 rounded-2xl text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              End Session
            </motion.button>
          )}
        </div>

        {isRunning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center max-w-sm"
          >
            🔍 Smart detection: tab switches (&gt;2.5s), inactivity (15s), random checks — with 10s cooldown
          </motion.p>
        )}

        {(elapsed > 0 || total > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <StatsPanel totalSeconds={elapsed} distractionSeconds={distractionTime} distractions={distractions} />
          </motion.div>
        )}
      </main>

      <DistractionDialog
        open={dialogOpen}
        detectionSource={detectionSource}
        onSelect={handleDistraction}
        onClose={() => setDialogOpen(false)}
      />

      {summaryData && (
        <SessionSummary
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          totalSeconds={summaryData.totalSeconds}
          distractionSeconds={summaryData.distractionSeconds}
          distractions={summaryData.distractions}
        />
      )}
    </div>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default Index;
