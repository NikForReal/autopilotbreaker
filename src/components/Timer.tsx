import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  isRunning: boolean;
  elapsedSeconds: number;
}

const Timer = ({ isRunning, elapsedSeconds }: TimerProps) => {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <motion.div
      className="flex items-center justify-center gap-2 font-mono text-7xl md:text-8xl tracking-tight"
      animate={isRunning ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
      transition={isRunning ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      <span className={isRunning ? "text-primary neon-text" : "text-muted-foreground"}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </motion.div>
  );
};

export default Timer;
