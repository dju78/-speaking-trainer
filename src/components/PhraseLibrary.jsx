import { MessageSquare, Timer } from "lucide-react";
import { professionalPhraseBanks } from "../data.js";

export default function PhraseLibrary() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <MessageSquare size={24} /> Professional speaking phrases
        </h2>
        <p className="mt-3 text-slate-300">Use these phrases to sound structured, confident, and clear.</p>
        <div className="mt-5 grid gap-3">
          {Object.values(professionalPhraseBanks)
            .flat()
            .filter((phrase, index, arr) => arr.indexOf(phrase) === index)
            .slice(0, 18)
            .map((phrase) => (
              <div key={phrase} className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-lg font-semibold">
                {phrase}
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Timer size={24} /> 7-day improvement plan
        </h2>
        <div className="mt-5 space-y-3">
          {[
            ["Day 1", "Record a 60-second professional introduction."],
            ["Day 2", "Practise one STAR answer."],
            ["Day 3", "Give a meeting update with progress, issue, and next step."],
            ["Day 4", "Explain a data insight to a non-technical person."],
            ["Day 5", "Open a presentation with a clear executive message."],
            ["Day 6", "Practise mind blank recovery phrases."],
            ["Day 7", "Run a full mock interview and review the progress verdict."],
          ].map(([day, task]) => (
            <div key={day} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="text-sm font-bold text-slate-400">{day}</div>
              <div className="mt-1 text-lg font-semibold">{task}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
