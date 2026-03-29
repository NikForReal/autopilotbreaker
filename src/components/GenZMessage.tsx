import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Bro... focus kaha gaya? 💀",
  "Phone khola ya phone ne tujhe khola?",
  "Bestie, ye productive lag raha hai tujhe? 😭",
  "pov: you trying to focus but your brain said sike",
  "no thoughts, just vibes... wait that's the problem",
  "the intrusive thoughts won again huh",
  "ratio + you got distracted + L + no focus",
  "bro really said 'lemme just check one thing' 🤡",
  "your brain: 'we don't do focus here'",
  "caught in 4k lacking focus fr fr",
  "skill issue tbh 💀",
  "tu focus kar raha tha ya bas pretend? 🫠",
  "autopilot mode ON — brain OFF",
  "tera attention span toh goldfish se bhi kam hai 🐟",
  "it's giving... not focused 💅",
];

interface GenZMessageProps {
  triggerCount: number;
}

const GenZMessage = ({ triggerCount }: GenZMessageProps) => {
  if (triggerCount === 0) return null;
  const message = messages[(triggerCount - 1) % messages.length];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={triggerCount}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="text-center py-3 px-6 glass rounded-full inline-block"
      >
        <span className="text-sm text-primary font-medium">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenZMessage;
