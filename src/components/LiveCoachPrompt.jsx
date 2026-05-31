import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const toneClasses = {
  green: "border-emerald-400/30 bg-emerald-500 text-white",
  amber: "border-amber-400/30 bg-amber-400 text-slate-950",
  purple: "border-violet-400/30 bg-violet-500 text-white",
};

export default function LiveCoachPrompt({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`absolute right-4 top-4 z-10 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl sm:relative sm:right-auto sm:top-auto ${toneClasses[message.tone]}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
        <MessageCircle size={18} className={message.tone === "amber" ? "text-slate-950" : "text-white"} />
      </div>
      <p className="text-sm font-bold">{message.text}</p>
    </motion.div>
  );
}
