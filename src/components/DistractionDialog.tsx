import { motion, AnimatePresence } from "framer-motion";

type DistractionReason = "habit" | "bored" | "intentional";

interface DistractionDialogProps {
  open: boolean;
  detectionSource?: string;
  onSelect: (reason: DistractionReason) => void;
  onClose: () => void;
}

const sourceMessages: Record<string, { title: string; subtitle: string }> = {
  tab_switch: { title: "Tab switch detected 👀", subtitle: "kaha ghoom ke aa raha hai bro?" },
  inactivity: { title: "Zoned out? 😴", subtitle: "kuch der se koi harkat nahi hai..." },
  random_check: { title: "Vibe check! 🎯", subtitle: "abhi focus hai ya bus stare kar raha hai?" },
  manual: { title: "Why tho? 👀", subtitle: "no cap, what pulled you away?" },
};

const reasons: { value: DistractionReason; label: string; emoji: string; desc: string }[] = [
  { value: "habit", label: "Habit", emoji: "🧠", desc: "Muscle memory took over" },
  { value: "bored", label: "Bored", emoji: "😴", desc: "Brain needed dopamine" },
  { value: "intentional", label: "Intentional", emoji: "🎯", desc: "Actually needed to check" },
];

const DistractionDialog = ({ open, detectionSource = "manual", onSelect, onClose }: DistractionDialogProps) => {
  const msg = sourceMessages[detectionSource] || sourceMessages.manual;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative glass rounded-2xl p-8 max-w-md w-full space-y-6 neon-glow"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">{msg.title}</h3>
              <p className="text-muted-foreground text-sm">{msg.subtitle}</p>
            </div>
            <div className="space-y-3">
              {reasons.map((r) => (
                <motion.button
                  key={r.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(r.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-colors text-left"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-foreground">{r.label}</div>
                    <div className="text-sm text-muted-foreground">{r.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
            >
              Nah, I'm focused — dismiss
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DistractionDialog;
