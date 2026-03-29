import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import DistractionDialog from "@/components/DistractionDialog";
import StatsPanel from "@/components/StatsPanel";
import GenZMessage from "@/components/GenZMessage";

type DistractionReason = "habit" | "bored" | "intentional";

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [distractions, setDistractions] = useState({ habit: 0, bored: 0, intentional: 0 });
  const [totalDistractions, setTotalDistractions] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleDistraction = useCallback((reason: DistractionReason) => {
    setDistractions((prev) => ({ ...prev, [reason]: prev[reason] + 1 }));
    setTotalDistractions((t) => t + 1);
    setDialogOpen(false);
  }, []);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setDistractions({ habit: 0, bored: 0, intentional: 0 });
    setTotalDistractions(0);
  };

  const total = distractions.habit + distractions.bored + distractions.intentional;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Session Active</span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        {/* Timer */}
        <Timer isRunning={isRunning} elapsedSeconds={elapsed} />

        {/* Gen Z Message */}
        <div className="min-h-[48px] flex items-center justify-center">
          <GenZMessage triggerCount={totalDistractions} />
        </div>

        {/* Controls */}
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
              onClick={() => setDialogOpen(true)}
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
              Reset
            </motion.button>
          )}
        </div>

        {/* Stats */}
        {(elapsed > 0 || total > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <StatsPanel totalSeconds={elapsed} distractions={distractions} />
          </motion.div>
        )}
      </main>

      <DistractionDialog
        open={dialogOpen}
        onSelect={handleDistraction}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
