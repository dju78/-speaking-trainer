import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";

import { modes, extraPrompts, professionalTemplates, suggestedClosingSentence, appFeedbackPhrases } from "./data.js";
import {
  formatTime,
  getTodayKey,
  cleanTranscript,
  generateProfessionalVersion,
  analyseTranscript,
  generateLiveCoachReport,
  speakText,
  stopSpeaking,
} from "./utils.js";

import { StatCard, ScoreBox, Metric, FeedbackItem } from "./components/UI.jsx";
import LiveCoachPrompt from "./components/LiveCoachPrompt.jsx";
import LiveCommunicationCoach from "./components/LiveCommunicationCoach.jsx";
import MindBlankOverlay from "./components/MindBlankOverlay.jsx";
import RecoveryRoom from "./components/RecoveryRoom.jsx";
import PhraseLibrary from "./components/PhraseLibrary.jsx";
import ProgressRoom from "./components/ProgressRoom.jsx";

export default function ProfessionalSpeakerTrainerApp() {
  const [selectedModeId, setSelectedModeId] = useState("professional-intro");
  const selectedMode = modes.find((m) => m.id === selectedModeId) || modes[0];
  const [customPrompt, setCustomPrompt] = useState(selectedMode.prompt);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("practice");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);
  const [coachReport, setCoachReport] = useState(null);
  const [liveMessage, setLiveMessage] = useState(null);
  const [transcriptView, setTranscriptView] = useState("raw");
  const [copySuccess, setCopySuccess] = useState(false);

  const recognitionRef = useRef(null);
  const finishedRef = useRef(false);
  const lastLiveMessageTime = useRef(0);
  const liveMessageTimeout = useRef(null);
  const lastFinalRef = useRef("");

  // Refs that stay in sync with state so recognition callbacks and finishPractice
  // always read the latest values regardless of when they were set up.
  const transcriptRef = useRef("");
  const elapsedSecondsRef = useRef(0);
  const sessionsRef = useRef([]);
  const finishPracticeRef = useRef(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const cleanedTranscript = useMemo(() => cleanTranscript(transcript), [transcript]);
  const professionalVersion = useMemo(() => generateProfessionalVersion(cleanedTranscript, selectedMode), [cleanedTranscript, selectedMode]);
  const analysis = useMemo(
    () => analyseTranscript(cleanedTranscript || transcript, Math.max(elapsedSeconds, 1)),
    [cleanedTranscript, transcript, elapsedSeconds],
  );

  // Load sessions from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem("speakerTrainerSessions");
    if (stored) {
      try { setSessions(JSON.parse(stored)); } catch { setSessions([]); }
    }
  }, []);

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem("speakerTrainerSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Reset when drill changes
  useEffect(() => {
    setCustomPrompt(selectedMode.prompt);
    resetPractice(false);
  }, [selectedModeId]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsedSeconds((v) => v + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Live coaching prompts during speaking
  useEffect(() => {
    if (!isRunning || isFinished) return;
    if (elapsedSeconds - lastLiveMessageTime.current < 20) return;

    let newMessage = null;
    let newTone = "green";
    const halfTime = Math.floor(selectedMode.guideDuration / 2);
    const wrapUpTime = Math.floor(selectedMode.guideDuration * 0.8);

    if (analysis.wpm > 160) { newMessage = "Slow down slightly"; newTone = "amber"; }
    else if (elapsedSeconds > 20 && analysis.wpm < 110) { newMessage = "Add more energy"; newTone = "amber"; }
    else if (analysis.fillerCount > 3 && elapsedSeconds % 30 < 5) { newMessage = "Avoid filler words, pause instead"; newTone = "amber"; }
    else if (elapsedSeconds === 20) { newMessage = "Use three clear points"; newTone = "green"; }
    else if (elapsedSeconds === halfTime) { newMessage = "Give an example"; newTone = "green"; }
    else if (elapsedSeconds === wrapUpTime) { newMessage = "Move to your result"; newTone = "green"; }
    else if (elapsedSeconds === wrapUpTime + 10) { newMessage = "End with a recommendation"; newTone = "green"; }

    if (newMessage) {
      setLiveMessage({ text: newMessage, tone: newTone });
      lastLiveMessageTime.current = elapsedSeconds;
      if (liveMessageTimeout.current) clearTimeout(liveMessageTimeout.current);
      liveMessageTimeout.current = setTimeout(() => setLiveMessage(null), 8000);
    }
  }, [elapsedSeconds, isRunning, isFinished, analysis, selectedMode.guideDuration]);

  // Set up speech recognition once per drill — no dependency on changing state.
  // The callbacks use refs so they always access latest values.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSpeechSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event) => {
      let finalText = "";
      let fullDetectedText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        fullDetectedText += ` ${text}`;
        if (result.isFinal) finalText += `${text} `;
      }

      if (finalText) {
        const trimmed = finalText.trim();
        if (trimmed === lastFinalRef.current) return;
        const lower = trimmed.toLowerCase();
        if (appFeedbackPhrases.some((p) => lower.includes(p))) return;
        lastFinalRef.current = trimmed;
        setTranscript((current) => `${current} ${trimmed}`.replace(/\s+/g, " ").trim());
      }

      if (/\bthank\s+you\b/i.test(fullDetectedText) && !finishedRef.current) {
        // Call through ref so we always invoke the latest version of finishPractice
        setTimeout(() => finishPracticeRef.current?.("voice"), 500);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [selectedModeId]); // Only recreate when the drill changes

  // Keep finishPracticeRef pointing to the latest finishPractice every render
  finishPracticeRef.current = finishPractice;

  const todaySessions = sessions.filter((s) => s.date.slice(0, 10) === getTodayKey()).length;
  const averageConfidence = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.analysis?.confidenceScore || 0), 0) / sessions.length)
    : 0;

  function startListening() {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setIsListening(true); } catch { setIsListening(true); }
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    setIsListening(false);
  }

  function startPractice() {
    stopSpeaking();
    setIsRunning(true);
    setIsFinished(false);
    setCoachReport(null);
    finishedRef.current = false;
    startListening();
  }

  function pausePractice() {
    setIsRunning(false);
    stopListening();
  }

  function finishPractice(source = "button") {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsRunning(false);
    setIsFinished(true);
    stopListening();

    // Use refs to guarantee we have the latest values — avoids stale closure bugs
    // when this is called from the speech recognition callback.
    const currentTranscript = transcriptRef.current;
    const currentElapsed = Math.max(elapsedSecondsRef.current, 1);
    const currentClean = cleanTranscript(currentTranscript);
    const currentAnalysis = analyseTranscript(currentClean || currentTranscript, currentElapsed);

    const report = generateLiveCoachReport({
      transcript: currentTranscript,
      analysis: currentAnalysis,
      mode: selectedMode,
      sessions: sessionsRef.current,
    });

    setCoachReport(report);
    speakText(report.spokenSummary);
  }

  function resetPractice(clearTranscriptAndNotes = true) {
    setIsRunning(false);
    setIsFinished(false);
    finishedRef.current = false;
    stopListening();
    stopSpeaking();
    setElapsedSeconds(0);
    setCoachReport(null);
    setLiveMessage(null);
    setTranscriptView("raw");
    setCopySuccess(false);
    lastLiveMessageTime.current = 0;
    lastFinalRef.current = "";
    if (liveMessageTimeout.current) clearTimeout(liveMessageTimeout.current);
    if (clearTranscriptAndNotes) {
      setTranscript("");
      setNotes("");
    }
  }

  function randomPrompt() {
    const prompt = extraPrompts[Math.floor(Math.random() * extraPrompts.length)];
    setCustomPrompt(prompt);
  }

  function practiseRecommendedDrill(drillId) {
    setSelectedModeId(drillId);
    setActiveTab("practice");
    resetPractice(true);
  }

  function saveSession() {
    const currentTranscript = transcriptRef.current;
    const currentElapsed = Math.max(elapsedSecondsRef.current, 1);
    const currentClean = cleanTranscript(currentTranscript);
    const currentAnalysis = analyseTranscript(currentClean || currentTranscript, currentElapsed);
    const report = coachReport || generateLiveCoachReport({
      transcript: currentTranscript,
      analysis: currentAnalysis,
      mode: selectedMode,
      sessions: sessionsRef.current,
    });
    const newSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      mode: selectedMode.title,
      modeId: selectedMode.id,
      prompt: customPrompt,
      transcript: currentTranscript,
      cleanedTranscript: currentClean,
      professionalVersion,
      notes,
      analysis: currentAnalysis,
      coachReport: report,
      elapsedSeconds: currentElapsed,
    };
    setSessions((current) => [newSession, ...current].slice(0, 50));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-3xl border border-[#082554]/20 bg-[#082554] p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-6 flex items-center gap-4">
                <img src="/favicon.svg" alt="Daramola Digital Labs Logo" className="h-16 w-16" />
                <div>
                  <h2 className="text-xl font-bold text-white">Speaking Trainer</h2>
                  <p className="text-sm font-bold text-[#16864C] bg-[#F8FAFC] px-2 py-0.5 rounded inline-block mt-1">by Daramola Digital Labs</p>
                </div>
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-[#F8FAFC]">
                <Sparkles size={16} className="text-[#C49A2C]" /> A product of Daramola Digital Labs
              </div>
              <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl">
                Speak clearly, recover confidently, and track real communication progress.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
                Speaking Trainer helps users practise spoken communication, improve pronunciation, review transcripts, and build confidence for interviews, presentations, workplace conversations and professional communication.
              </p>
              <div className="mt-5 max-w-2xl border-l-4 border-[#16864C] pl-4">
                <p className="text-sm leading-6 text-[#C49A2C] font-medium">
                  Daramola Digital Labs builds practical, data-driven digital tools that support compliance, financial reporting, research, education, healthcare and community development. Our products combine data analysis, automation and user-centred design to solve real-world problems.
                </p>
              </div>
            </div>
            <div className="grid min-w-[260px] grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <StatCard label="Today" value={todaySessions} icon={<CheckCircle2 size={18} />} />
              <StatCard label="Average" value={`${averageConfidence}%`} icon={<BarChart3 size={18} />} />
              <StatCard label="Saved" value={sessions.length} icon={<Trophy size={18} />} />
            </div>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2">
          {[
            ["practice", "Practice Room", Mic],
            ["recovery", "Mind Blank Rescue", Brain],
            ["library", "Phrase Library", MessageSquare],
            ["progress", "Progress", BarChart3],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === id ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {activeTab === "practice" && (
          <PracticeTab
            modes={modes}
            selectedModeId={selectedModeId}
            selectedMode={selectedMode}
            setSelectedModeId={setSelectedModeId}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            elapsedSeconds={elapsedSeconds}
            isRunning={isRunning}
            isFinished={isFinished}
            transcript={transcript}
            setTranscript={setTranscript}
            notes={notes}
            setNotes={setNotes}
            isListening={isListening}
            speechSupported={speechSupported}
            coachReport={coachReport}
            liveMessage={liveMessage}
            transcriptView={transcriptView}
            setTranscriptView={setTranscriptView}
            cleanedTranscript={cleanedTranscript}
            professionalVersion={professionalVersion}
            analysis={analysis}
            copySuccess={copySuccess}
            setCopySuccess={setCopySuccess}
            onStart={startPractice}
            onPause={pausePractice}
            onFinish={() => finishPractice("button")}
            onReset={() => resetPractice(true)}
            onRandomPrompt={randomPrompt}
            onSave={saveSession}
            onMindBlank={() => setShowRecovery(true)}
            onPracticeRecommended={practiseRecommendedDrill}
          />
        )}
        {activeTab === "recovery" && <RecoveryRoom />}
        {activeTab === "library" && <PhraseLibrary />}
        {activeTab === "progress" && <ProgressRoom sessions={sessions} setSessions={setSessions} />}
      </div>

      <footer className="mt-8 border-t border-white/10 bg-[#082554] py-8 text-center text-sm text-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-3">
          <img src="/favicon.svg" alt="Daramola Digital Labs Logo" className="h-8 w-8 opacity-90" />
          <div>
            <p>© 2026 Daramola Digital Labs. All rights reserved.</p>
            <p className="mt-1 text-white/70">Speaking Trainer is a product of Daramola Digital Labs.</p>
          </div>
        </div>
      </footer>

      {showRecovery && <MindBlankOverlay onClose={() => setShowRecovery(false)} />}
    </div>
  );
}

function PracticeTab({
  modes, selectedModeId, selectedMode, setSelectedModeId,
  customPrompt, setCustomPrompt, elapsedSeconds, isRunning, isFinished,
  transcript, setTranscript, notes, setNotes, isListening, speechSupported,
  coachReport, liveMessage, transcriptView, setTranscriptView,
  cleanedTranscript, professionalVersion, analysis, copySuccess, setCopySuccess,
  onStart, onPause, onFinish, onReset, onRandomPrompt, onSave,
  onMindBlank, onPracticeRecommended,
}) {
  return (
    <main className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <ClipboardList size={22} /> Choose your drill
        </h2>
        <div className="space-y-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedModeId(mode.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedModeId === mode.id
                  ? "border-white bg-white text-slate-950"
                  : "border-white/10 bg-slate-900/50 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">{mode.title}</h3>
                <span className="shrink-0 rounded-full bg-slate-950/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Guide {formatTime(mode.guideDuration)}
                </span>
              </div>
              <p className={`mt-1.5 text-xs leading-relaxed ${selectedModeId === mode.id ? "text-slate-700" : "text-slate-400"}`}>
                {mode.goal}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{mode.level}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold">{selectedMode.title}</h2>
              <p className="mt-2 text-slate-300">{selectedMode.goal}</p>
              <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Speak naturally. When you are finished, say <strong>"thank you"</strong> or press <strong>Finish Speaking</strong>. The timer will stop at your real speaking time.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-center">
              <div className="text-sm text-slate-400">Your speaking time</div>
              <div className="mt-1 font-mono text-4xl font-bold">{formatTime(elapsedSeconds)}</div>
              <div className="mt-1 text-xs text-slate-500">Guide: {formatTime(selectedMode.guideDuration)}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 2xl:grid-cols-[1fr_280px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Speaking prompt</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-base leading-relaxed text-slate-100 outline-none focus:border-white/30"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={onRandomPrompt} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                  Generate prompt
                </button>
                <button onClick={onStart} disabled={isRunning} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">
                  <Play size={16} /> Start
                </button>
                <button onClick={onPause} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                  <Pause size={16} /> Pause
                </button>
                <button
                  onClick={onFinish}
                  disabled={isFinished || (!isRunning && !transcript)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> Finish Speaking
                </button>
                <button onClick={onMindBlank} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2 text-sm font-bold text-white hover:bg-violet-400">
                  <Brain size={16} /> Mind Blank
                </button>
                <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                  <RotateCcw size={16} /> Reset
                </button>
                <button onClick={onSave} disabled={!transcript} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                  <Save size={16} /> Save session
                </button>
              </div>

              {!speechSupported && (
                <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                  Speech recognition is not supported in this browser. You can still type your transcript manually and press Finish Speaking.
                </div>
              )}
              {speechSupported && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  {isListening ? <Volume2 size={16} className="animate-pulse" /> : <Mic size={16} />}
                  {isListening ? "Listening. End with thank you when finished." : "Speech recognition is ready. Press Start and speak clearly."}
                </div>
              )}
              {isFinished && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  <CheckCircle2 size={18} /> Session finished at {formatTime(elapsedSeconds)}.
                  <button onClick={stopSpeaking} className="rounded-xl border border-emerald-200/30 px-3 py-1 font-semibold hover:bg-emerald-300/10">
                    Stop spoken feedback
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
              <h3 className="mb-3 font-bold">Use this structure</h3>
              <ol className="space-y-2">
                {selectedMode.structure.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-xl bg-white/5 p-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {coachReport && (
          <LiveCommunicationCoach
            report={coachReport}
            analysis={analysis}
            onPractice={() => onPracticeRecommended(coachReport.recommendedDrill.id)}
          />
        )}

        <div className="grid gap-6 2xl:grid-cols-2">
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Mic size={20} /> Transcript
              </h3>
              <AnimatePresence>
                {liveMessage && <LiveCoachPrompt message={liveMessage} />}
              </AnimatePresence>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {[["raw", "Raw"], ["clean", "Clean"], ["professional", "Professional"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTranscriptView(id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    transcriptView === id ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
              {transcriptView === "professional" && professionalVersion && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(professionalVersion).then(() => {
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    });
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-400"
                >
                  <ClipboardList size={14} />
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            {transcriptView === "raw" && (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your speech transcript will appear here. You can also type it manually after practice."
                className="min-h-[300px] w-full rounded-2xl border border-white/10 bg-slate-950 p-5 text-lg leading-relaxed text-slate-100 outline-none focus:border-white/30"
              />
            )}
            {transcriptView === "clean" && (
              <div className="min-h-[300px] rounded-2xl border border-white/10 bg-slate-950 p-5 text-lg leading-relaxed text-slate-100">
                {cleanedTranscript || <span className="text-slate-500">Speak or type to see the cleaned transcript.</span>}
              </div>
            )}
            {transcriptView === "professional" && (
              <div className="min-h-[300px] rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-lg leading-relaxed text-emerald-50">
                {professionalVersion ? (
                  professionalVersion.split("\n\n").map((para, i) => (
                    <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                  ))
                ) : (
                  <span className="text-slate-500">Speak at least 15 words to generate a professional version.</span>
                )}
              </div>
            )}

            {transcript && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Speaking templates</h4>
                <div className="flex flex-wrap gap-2">
                  {professionalTemplates.map((t) => (
                    <span key={t.label} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                      <strong className="text-slate-100">{t.label}:</strong> {t.text}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs italic text-slate-500">
                  Suggested closing: "{suggestedClosingSentence}"
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <BarChart3 size={20} /> Feedback scorecard
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBox label="Confidence" value={analysis.confidenceScore} />
              <ScoreBox label="Clarity" value={analysis.clarityScore} />
              <ScoreBox label="Structure" value={analysis.structureScore} />
              <ScoreBox label="Delivery" value={analysis.deliveryScore} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Words" value={analysis.wordCount} />
              <Metric label="WPM" value={analysis.wpm} />
              <Metric label="Fillers" value={analysis.fillerCount} />
            </div>
            <div className="mt-4 space-y-3">
              <FeedbackItem text={analysis.paceFeedback} />
              <FeedbackItem text={analysis.fillerFeedback} />
              <FeedbackItem text={analysis.structureFeedback} />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write one improvement target. Example: I will pause before answering and use three clear points."
              className="mt-4 min-h-[100px] w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-100 outline-none focus:border-white/30"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
