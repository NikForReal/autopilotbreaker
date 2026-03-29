import { motion } from "framer-motion";

interface StatsPanelProps {
  totalSeconds: number;
  distractions: { habit: number; bored: number; intentional: number };
}

const StatsPanel = ({ totalSeconds, distractions }: StatsPanelProps) => {
  const total = distractions.habit + distractions.bored + distractions.intentional;
  const minutes = Math.floor(totalSeconds / 60);

  const stats = [
    { label: "Total Time", value: `${minutes}m`, icon: "⏱️" },
    { label: "Distractions", value: total.toString(), icon: "💀" },
    { label: "Habit", value: distractions.habit.toString(), icon: "🧠" },
    { label: "Bored", value: distractions.bored.toString(), icon: "😴" },
    { label: "Intentional", value: distractions.intentional.toString(), icon: "🎯" },
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
