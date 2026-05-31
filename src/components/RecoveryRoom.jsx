import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2 } from "lucide-react";
import { recoveryPhrases } from "../data.js";

export default function RecoveryRoom() {
  const [selectedPhrase, setSelectedPhrase] = useState(recoveryPhrases[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Brain size={24} /> Mind Blank Rescue Method
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          When you lose your words, do not panic. Use a short pause, breathe, then restart with a clear bridge phrase.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["1", "Pause", "Stop for two seconds. Silence is better than panic."],
            ["2", "Breathe", "Take one slow breath. Relax your shoulders."],
            ["3", "Bridge", "Use a prepared sentence to regain control."],
            ["4", "Continue", "Return to your main point using a simple structure."],
          ].map(([number, title, text]) => (
            <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950">{number}</div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <h3 className="text-xl font-bold">Practise this recovery phrase</h3>
          <p className="mt-4 rounded-2xl bg-white p-5 text-2xl font-bold leading-snug text-slate-950">"{selectedPhrase}"</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {recoveryPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => setSelectedPhrase(phrase)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                Use phrase
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
        <h3 className="text-xl font-bold">Daily confidence drill</h3>
        <div className="mt-4 space-y-3">
          {[
            "Stand up and breathe slowly for 10 seconds.",
            "Say your first sentence twice before continuing.",
            "Speak in three points: first, second, finally.",
            "Pause for two seconds after each point.",
            "End with one strong summary sentence.",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
              <CheckCircle2 size={18} className="shrink-0" /> {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
