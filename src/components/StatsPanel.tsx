import { motion } from "framer-motion";

interface StatsPanelProps {
  totalSeconds: number;
  distractionSeconds: number;
  distractions: { habit: number; bored: number; intentional: number };
}

const StatsPanel = ({ totalSeconds, distractionSeconds, distractions }: StatsPanelProps) => {
  const total = distractions.habit + distractions.bored + distractions.intentional;
  const focusedSeconds = Math.max(0, totalSeconds - distractionSeconds);
  const focusPct = totalSeconds > 0 ? Math.round((focusedSeconds / totalSeconds) * 100) : 100;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const stats = [
    { label: "Session", value: fmt(totalSeconds), icon: "⏱️" },
    { label: "Focused", value: fmt(focusedSeconds), icon: "🎯" },
    { label: "Distracted", value: fmt(distractionSeconds), icon: "😵" },
    { label: "Focus %", value: `${focusPct}%`, icon: focusPct >= 70 ? "🟢" : "🔴" },
    { label: "Count", value: total.toString(), icon: "💀" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 text-center space-y-1"
        >
          <div className="text-2xl">{stat.icon}</div>
          <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsPanel;
