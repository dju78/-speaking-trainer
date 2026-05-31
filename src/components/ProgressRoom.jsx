import { Download, Trophy, Upload } from "lucide-react";
import { useRef } from "react";
import { formatTime } from "../utils.js";
import { Metric } from "./UI.jsx";

export default function ProgressRoom({ sessions, setSessions }) {
  const importRef = useRef(null);

  const averageScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.analysis?.confidenceScore || 0), 0) / sessions.length)
    : 0;
  const averageWpm = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.analysis?.wpm || 0), 0) / sessions.length)
    : 0;
  const averageFillers = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.analysis?.fillerCount || 0), 0) / sessions.length)
    : 0;
  const recent = sessions.slice(0, 10).reverse();

  function handleExport() {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speaking-trainer-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        setSessions((current) => {
          const existingIds = new Set(current.map((s) => s.id));
          const newSessions = imported.filter((s) => s.id && !existingIds.has(s.id));
          return [...newSessions, ...current].slice(0, 50);
        });
      } catch {
        alert("Could not import file. Make sure it is a valid sessions export.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleClear() {
    if (window.confirm("Delete all saved sessions? This cannot be undone.")) {
      setSessions([]);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy size={24} /> Practice History Report
          </h2>
          <p className="mt-2 text-slate-300">Track whether your communication skill is improving, stable, or declining.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={sessions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            <Upload size={14} /> Import
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={handleClear} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
            Clear all
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric label="Average score" value={`${averageScore}%`} />
        <Metric label="Average WPM" value={averageWpm} />
        <Metric label="Average fillers" value={averageFillers} />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900 p-5">
        <h3 className="text-lg font-bold">Last 10 sessions trend</h3>
        <div className="mt-4 flex h-36 items-end gap-2">
          {recent.length === 0 && <p className="text-sm text-slate-400">No saved sessions yet.</p>}
          {recent.map((session) => (
            <div key={session.id} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-white"
                style={{ height: `${Math.max(8, session.analysis?.confidenceScore || 0)}%` }}
              />
              <div className="text-xs text-slate-500">{session.analysis?.confidenceScore || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {sessions.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
            No saved sessions yet. Complete one practice session and press Save session.
          </div>
        )}
        {sessions.map((session) => (
          <article key={session.id} className="rounded-3xl border border-white/10 bg-slate-900 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xl font-bold">{session.mode}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date(session.date).toLocaleString()} · {formatTime(session.elapsedSeconds || 0)}
                </p>
                <p className="mt-3 text-slate-300">{session.prompt}</p>
                {session.coachReport?.improvementArea && (
                  <p className="mt-3 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">
                    Main weakness: {session.coachReport.improvementArea.name}. Next drill: {session.coachReport.recommendedDrill?.title}.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric label="Score" value={`${session.analysis?.confidenceScore || 0}%`} />
                <Metric label="WPM" value={session.analysis?.wpm || 0} />
                <Metric label="Fillers" value={session.analysis?.fillerCount || 0} />
              </div>
            </div>
            {session.notes && (
              <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
                Improvement target: {session.notes}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
