import { motion, AnimatePresence } from "framer-motion";

interface FocusWarningProps {
  distractionCount: number;
  elapsedSeconds: number;
}

const FocusWarning = ({ distractionCount, elapsedSeconds }: FocusWarningProps) => {
  const minutes = elapsedSeconds / 60;
  // Show warning if more than 2 distractions in under 5 minutes, or rate > 1 per 2 min
  const show = distractionCount >= 3 || (minutes > 0 && distractionCount / minutes > 0.5);

  return (
    <AnimatePresence>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-destructive text-sm font-medium mt-2 text-center animate-pulse"
        >
          ⚠️ You're losing focus — distractions are piling up!
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default FocusWarning;
