import { AlertCircle } from "lucide-react";

export function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-200">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

export function ScoreBox({ label, value }) {
  return (
    <div className="flex min-h-[110px] flex-col justify-center rounded-2xl border border-white/10 bg-slate-900 p-4 text-center">
      <div className="mb-1 text-3xl font-bold">{value}%</div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-auto h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

export function FeedbackItem({ text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
