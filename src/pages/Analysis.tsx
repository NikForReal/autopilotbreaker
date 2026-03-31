import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadSessions } from "@/hooks/useSessionStorage";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const COLORS = {
  habit: "hsl(0 72% 55%)",
  bored: "hsl(45 90% 55%)",
  intentional: "hsl(200 80% 55%)",
  focused: "hsl(142 72% 50%)",
  distracted: "hsl(0 72% 55%)",
};

const chartConfig: ChartConfig = {
  habit: { label: "Habit", color: COLORS.habit },
  bored: { label: "Bored", color: COLORS.bored },
  intentional: { label: "Intentional", color: COLORS.intentional },
  focused: { label: "Focused", color: COLORS.focused },
  distracted: { label: "Distracted", color: COLORS.distracted },
  focus: { label: "Focus %", color: "hsl(142 72% 50%)" },
};

const Analysis = () => {
  const navigate = useNavigate();
  const allSessions = loadSessions();
  const sessions = allSessions.slice(-10); // Last 10 sessions only

  const stats = useMemo(() => {
    const totalSeconds = sessions.reduce((s, r) => s + r.totalSeconds, 0);
    const distractionSeconds = sessions.reduce((s, r) => s + (r.distractionSeconds || 0), 0);
    const focusedSeconds = Math.max(0, totalSeconds - distractionSeconds);
    const habit = sessions.reduce((s, r) => s + r.distractions.habit, 0);
    const bored = sessions.reduce((s, r) => s + r.distractions.bored, 0);
    const intentional = sessions.reduce((s, r) => s + r.distractions.intentional, 0);
    const totalDistractions = habit + bored + intentional;

    const focusPct = totalSeconds > 0 ? Math.round((focusedSeconds / totalSeconds) * 100) : 100;
    const distractionPct = 100 - focusPct;
    const autopilotScore = Math.min(100, distractionPct);

    const reasons = { habit, bored, intentional };
    const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0];

    // Per-session focus percentages for trend
    const sessionFocusPcts = sessions.map((s) => {
      const focused = Math.max(0, s.totalSeconds - (s.distractionSeconds || 0));
      return s.totalSeconds > 0 ? Math.round((focused / s.totalSeconds) * 100) : 100;
    });
    const avgFocusPct = sessionFocusPcts.length > 0
      ? Math.round(sessionFocusPcts.reduce((a, b) => a + b, 0) / sessionFocusPcts.length)
      : 100;

    return {
      totalSeconds, distractionSeconds, focusedSeconds, totalDistractions,
      habit, bored, intentional, autopilotScore, focusPct, distractionPct,
      topReason, sessionCount: sessions.length, avgFocusPct,
    };
  }, [sessions]);

  // Bar chart data — per-session focus %
  const barData = useMemo(() => {
    return sessions.map((s, i) => {
      const focused = Math.max(0, s.totalSeconds - (s.distractionSeconds || 0));
      const pct = s.totalSeconds > 0 ? Math.round((focused / s.totalSeconds) * 100) : 100;
      return { name: `#${i + 1}`, focus: pct };
    });
  }, [sessions]);

  const pieReasons = [
    { name: "Habit", value: stats.habit, fill: COLORS.habit },
    { name: "Bored", value: stats.bored, fill: COLORS.bored },
    { name: "Intentional", value: stats.intentional, fill: COLORS.intentional },
  ].filter((d) => d.value > 0);

  const pieTime = [
    { name: "Focused", value: Math.round(stats.focusedSeconds / 60) || 0, fill: COLORS.focused },
    { name: "Distracted", value: Math.round(stats.distractionSeconds / 60) || 0, fill: COLORS.distracted },
  ].filter((d) => d.value > 0);

  const insights = useMemo(() => {
    const msgs: string[] = [];
    if (stats.totalDistractions === 0 && stats.sessionCount === 0) {
      msgs.push("No data yet — start a session to see insights! 🚀");
      return msgs;
    }

    if (stats.distractionPct > 0) {
      msgs.push(`You spent ${stats.distractionPct}% of your time distracted ${stats.distractionPct > 30 ? "⚠️" : "📊"}`);
    }

    if (stats.avgFocusPct >= 80) msgs.push("Your focus is on fire 🔥 Keep it up!");
    else if (stats.avgFocusPct >= 50) msgs.push("Your focus time is improving 📈");
    else msgs.push("You are getting distracted frequently ⚠️");

    if (stats.topReason[1] > 0) {
      const labels: Record<string, string> = {
        habit: "Most of your distractions are due to habit 💀",
        bored: "Boredom is your biggest enemy 😴",
        intentional: "At least your distractions are intentional 🎯",
      };
      msgs.push(labels[stats.topReason[0]]);
    }

    if (stats.autopilotScore > 60) msgs.push("You are losing too much time ⚠️ Try shorter sessions 🧠");
    if (stats.sessionCount >= 5) msgs.push(`You've completed ${stats.sessionCount} sessions — consistency matters! 💪`);

    return msgs;
  }, [stats]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const pct = (val: number) =>
    stats.totalDistractions > 0 ? Math.round((val / stats.totalDistractions) * 100) : 0;

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Timer
          </motion.button>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold neon-text mb-1">📊 Analysis & Insights</h2>
          <p className="text-sm text-muted-foreground">
            Last {stats.sessionCount} session{stats.sessionCount !== 1 ? "s" : ""} • Avg Focus: {stats.avgFocusPct}%
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Time", value: fmt(stats.totalSeconds), icon: "⏱️" },
            { label: "Focused", value: fmt(stats.focusedSeconds), icon: "🎯" },
            { label: "Distracted", value: fmt(stats.distractionSeconds), icon: "😵" },
            { label: "Avg Focus", value: `${stats.avgFocusPct}%`, icon: stats.avgFocusPct >= 50 ? "🟢" : "🔴" },
            { label: "Sessions", value: stats.sessionCount.toString(), icon: "📋" },
            { label: "Top Reason", value: stats.topReason[1] > 0 ? stats.topReason[0] : "—", icon: "💀" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 text-center space-y-1"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-xl font-bold font-mono text-foreground capitalize">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Autopilot Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 space-y-3"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Autopilot Score</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.autopilotScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, hsl(var(--primary)), ${
                    stats.autopilotScore > 60 ? "hsl(var(--destructive))" : "hsl(45 90% 55%)"
                  })`,
                }}
              />
            </div>
            <span className="text-xl font-bold font-mono text-foreground">{stats.autopilotScore}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.autopilotScore < 30
              ? "Low autopilot — you're in control! 🎯"
              : stats.autopilotScore < 60
                ? "Moderate autopilot — stay aware 👀"
                : "High autopilot — your brain is on cruise control 💀"}
          </p>
        </motion.div>

        {/* Session Focus Bar Chart */}
        {barData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl p-6 space-y-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Focus % Per Session (Last {barData.length})
            </h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="focus" radius={[4, 4, 0, 0]} fill={COLORS.focused} />
              </BarChart>
            </ChartContainer>
          </motion.div>
        )}

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pieTime.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Focus vs Distraction Time
              </h3>
              <ChartContainer config={chartConfig} className="aspect-square max-h-[220px] mx-auto">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={pieTime} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {pieTime.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex justify-center gap-4 text-xs">
                {pieTime.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: d.fill }} />
                    <span className="text-muted-foreground">{d.name} {d.value}m</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {pieReasons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Distraction Breakdown
              </h3>
              <ChartContainer config={chartConfig} className="aspect-square max-h-[220px] mx-auto">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={pieReasons} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {pieReasons.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex justify-center gap-4 text-xs">
                {pieReasons.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: d.fill }} />
                    <span className="text-muted-foreground">{d.name} {pct(d.value)}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6 space-y-3"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">💡 Insights</h3>
          <div className="space-y-2">
            {insights.map((msg, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-sm text-foreground py-2 px-3 rounded-lg bg-secondary/50"
              >
                {msg}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Analysis;
