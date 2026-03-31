import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionSummaryProps {
  open: boolean;
  onClose: () => void;
  totalSeconds: number;
  distractionSeconds: number;
  distractions: { habit: number; bored: number; intentional: number };
}

const SessionSummary = ({
  open,
  onClose,
  totalSeconds,
  distractionSeconds,
  distractions,
}: SessionSummaryProps) => {
  const focusedSeconds = Math.max(0, totalSeconds - distractionSeconds);
  const focusPct = totalSeconds > 0 ? Math.round((focusedSeconds / totalSeconds) * 100) : 100;
  const total = distractions.habit + distractions.bored + distractions.intentional;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const getMessage = () => {
    if (focusPct >= 80) return { text: "Amazing focus session! 🔥", color: "text-green-400" };
    if (focusPct >= 60) return { text: "Good focus today! Keep pushing 💪", color: "text-primary" };
    if (focusPct >= 40) return { text: "Room for improvement — stay aware 👀", color: "text-yellow-400" };
    return { text: "You lost focus frequently ⚠️ Try shorter sessions", color: "text-destructive" };
  };

  const message = getMessage();

  const stats = [
    { label: "Session Time", value: fmt(totalSeconds), icon: "⏱️" },
    { label: "Focused Time", value: fmt(focusedSeconds), icon: "🎯" },
    { label: "Distracted Time", value: fmt(distractionSeconds), icon: "😵" },
    { label: "Focus Score", value: `${focusPct}%`, icon: focusPct >= 60 ? "🟢" : "🔴" },
    { label: "Distractions", value: total.toString(), icon: "💀" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold neon-text text-center">
            📋 Session Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center text-lg font-bold ${message.color}`}
          >
            {message.text}
          </motion.p>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-secondary/50 rounded-xl p-3 text-center space-y-1 ${
                  i === stats.length - 1 ? "col-span-2" : ""
                }`}
              >
                <div className="text-lg">{stat.icon}</div>
                <div className="text-lg font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {total > 0 && (
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Habit: {distractions.habit}</span>
              <span>Bored: {distractions.bored}</span>
              <span>Intentional: {distractions.intentional}</span>
            </div>
          )}

          {/* Focus bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focus</span>
              <span>{focusPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${focusPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-primary neon-glow"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow-strong hover:brightness-110 transition-all"
          >
            Done ✓
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionSummary;
