import { motion } from "framer-motion";
import { MessageCircle, Play } from "lucide-react";
import { suggestedClosingSentence } from "../data.js";
import { Metric } from "./UI.jsx";

const toneClasses = {
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

export default function LiveCommunicationCoach({ report, analysis, onPractice }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-2xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg">
            <MessageCircle size={30} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">Live Communication Coach</p>
            <h2 className="mt-1 text-2xl font-bold">{report.progress.title}</h2>
            <p className="mt-2 max-w-4xl text-slate-300">{report.progress.message}</p>
          </div>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${toneClasses[report.progress.tone]}`}>
          {report.progress.status === "improving" ? "Progress Up" : report.progress.status === "declining" ? "Needs Focus" : "Monitor Progress"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-bold">Main improvement area</h3>
          <div className="mt-3 rounded-2xl bg-amber-400/10 p-4 text-amber-100">
            <div className="text-2xl font-bold">{report.improvementArea.name}</div>
            <p className="mt-2 text-sm leading-6">{report.improvementArea.reason}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Metric label="WPM" value={analysis.wpm} />
            <Metric label="Fillers" value={analysis.fillerCount} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2"
        >
          <h3 className="text-lg font-bold">Better way to say it</h3>
          <div className="mt-3 grid gap-3">
            {report.reframes.length === 0 && analysis.wordCount < 20 && (
              <p className="text-sm text-slate-400">Speak or type at least 20 words to receive reframe suggestions.</p>
            )}
            {report.reframes.length === 0 && analysis.wordCount >= 20 && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Professional reframe</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-emerald-100">{suggestedClosingSentence}</p>
              </div>
            )}
            {report.reframes.map((item, index) => (
              <div key={`${item.original}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You said</p>
                <p className="mt-1 text-sm text-slate-300">&ldquo;{item.original}&rdquo;</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">Better way to say it</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-emerald-100">&ldquo;{item.improved}&rdquo;</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <h3 className="text-lg font-bold">Best language to use next</h3>
          <div className="mt-3 grid gap-2">
            {report.phraseBank.map((phrase) => (
              <div key={phrase} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200">
                {phrase}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <h3 className="text-lg font-bold">Coach message</h3>
          <p className="mt-3 rounded-2xl bg-sky-400/10 p-4 text-sm leading-6 text-sky-100">{report.coachMessage}</p>
          <button
            onClick={onPractice}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200"
          >
            <Play size={16} /> Practise Recommended Drill
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
