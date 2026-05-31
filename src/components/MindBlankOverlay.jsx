import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { recoveryPhrases } from "../data.js";

export default function MindBlankOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Brain size={24} /> Mind Blank Recovery
        </h2>
        <p className="mt-2 text-slate-300">Pause. Breathe. Choose one phrase and continue calmly.</p>
        <div className="mt-5 grid gap-3">
          {recoveryPhrases.map((phrase) => (
            <button
              key={phrase}
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-lg font-semibold hover:bg-white/10"
            >
              "{phrase}"
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
          Close
        </button>
      </motion.div>
    </div>
  );
}
