import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mic, Timer, Brain, Trophy, Save, RotateCcw, Play, Pause,
  Sparkles, ClipboardList, BarChart3, MessageSquare,
  CheckCircle2, AlertCircle, Volume2,
} from "lucide-react";

const modes = [
  {
    id: "professional-intro",
    title: "Professional Introduction",
    duration: 90,
    level: "Beginner",
    goal: "Introduce yourself clearly in interviews, meetings, and networking situations.",
    structure: ["Who you are", "What you do", "Your strongest skill", "The value you bring"],
    prompt: "Introduce yourself as a data analyst and policy researcher in 90 seconds. Make it clear, confident, and relevant to a professional audience.",
  },
  {
    id: "star-answer",
    title: "STAR Interview Answer",
    duration: 180,
    level: "Intermediate",
    goal: "Answer behavioural interview questions with structure and impact.",
    structure: ["Situation", "Task", "Action", "Result", "Learning"],
    prompt: "Tell me about a time you improved the quality of a report, dataset, or service. Use the STAR structure.",
  },
  {
    id: "meeting-update",
    title: "Meeting Update",
    duration: 120,
    level: "Beginner",
    goal: "Speak clearly when giving updates to managers or colleagues.",
    structure: ["Progress", "Key issue", "Action needed", "Next step"],
    prompt: "Give a two-minute update on a project you are working on. Explain progress, risks, and next steps.",
  },
  {
    id: "presentation-opening",
    title: "Presentation Opening",
    duration: 120,
    level: "Intermediate",
    goal: "Start presentations with confidence and authority.",
    structure: ["Greeting", "Topic", "Why it matters", "What you will cover"],
    prompt: "Open a short presentation on why good data quality matters in public policy and decision-making.",
  },
  {
    id: "mind-blank-recovery",
    title: "Mind Blank Recovery",
    duration: 60,
    level: "Confidence Builder",
    goal: "Recover calmly when you forget your words mid-speech.",
    structure: ["Pause", "Breathe", "Repeat the question", "Bridge back to your point"],
    prompt: "Practise recovering after forgetting your point. Pause, breathe, and restart using one of the recovery phrases.",
  },
];

const interviewQuestions = [
  { q: "Tell us about yourself.", hint: "Who you are → what you do → your key value", duration: 90 },
  { q: "Why are you interested in this role?", hint: "Skills match → motivation → contribution", duration: 90 },
  { q: "Describe a time you improved quality.", hint: "Situation → action → measurable result", duration: 120 },
  { q: "Tell us about a time you worked under pressure.", hint: "Context → your approach → outcome", duration: 120 },
  { q: "How do you communicate complex data to non-technical people?", hint: "Method → example → impact", duration: 120 },
  { q: "Why should we hire you?", hint: "Strengths → fit → unique value", duration: 90 },
  { q: "Describe a time you worked with others to deliver a result.", hint: "Team context → your role → outcome", duration: 120 },
];

const extraPrompts = [
  "Explain your strongest professional achievement in two minutes.",
  "Describe a difficult workplace situation and how you handled it.",
  "Explain a complex data insight to a non-technical manager.",
  "Give a short speech on why evidence matters in policy decisions.",
  "Answer: Why should we hire you?",
  "Answer: Tell us about yourself.",
  "Explain how you maintain data quality.",
  "Speak for one minute about your career goals.",
  "Explain a time you worked with others to deliver a result.",
  "Give a briefing to a Deputy Director on a key finding from a dataset.",
];

const recoveryPhrases = [
  "Let me pause for a moment and structure my answer clearly.",
  "The key point I want to make is this.",
  "To put that more clearly, my answer is in three parts.",
  "Let me return to the main point.",
  "That is an important question. I will start with the context, then explain my action.",
  "I want to make sure I answer that properly, so I will break it down.",
];

const powerPhrases = [
  "The evidence suggests that...",
  "The key insight is...",
  "From a practical perspective...",
  "The main risk is...",
  "The next step should be...",
  "My recommendation is...",
  "This matters because...",
  "In summary...",
];

const fillerWords = ["um", "uh", "erm", "like", "basically", "actually", "you know", "sort of", "kind of", "right"];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function analyseTranscript(transcript, elapsedSeconds) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const lower = transcript.toLowerCase();
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  const wpm = elapsedSeconds > 0 ? Math.round((words.length / elapsedSeconds) * 60) : 0;
  const sentenceCount = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const structureSignals = ["first", "second", "finally", "because", "therefore", "in summary", "my recommendation", "the key"].filter((s) => lower.includes(s)).length;

  let paceFeedback = "Start speaking to calculate your pace.";
  if (wpm > 0 && wpm < 110) paceFeedback = "Your pace may be too slow. Add energy and reduce long gaps.";
  if (wpm >= 110 && wpm <= 160) paceFeedback = "Your pace is strong and professional.";
  if (wpm > 160) paceFeedback = "Your pace may be too fast. Slow down and use short pauses.";

  let fillerFeedback = "No transcript yet.";
  if (words.length > 0 && fillerCount <= 2) fillerFeedback = "Good control of filler words.";
  if (fillerCount > 2 && fillerCount <= 6) fillerFeedback = "Some filler words detected. Use pauses instead of rushing.";
  if (fillerCount > 6) fillerFeedback = "High filler word use. Practise pausing silently for two seconds.";

  let structureFeedback = "Use signposting words to guide your listener.";
  if (structureSignals >= 2) structureFeedback = "Good structure. You used helpful signposting language.";

  const clarityScore = Math.min(100, Math.round(45 + Math.min(words.length, 120) * 0.25 + structureSignals * 8 - fillerCount * 3));
  const paceScore = wpm >= 110 && wpm <= 160 ? 90 : wpm === 0 ? 0 : wpm < 110 ? 62 : 58;
  const structureScore = Math.min(100, Math.round(40 + structureSignals * 15 + Math.min(sentenceCount, 8) * 3));
  const deliveryScore = Math.max(0, Math.min(100, Math.round(50 + (paceScore * 0.3) - fillerCount * 4 + Math.min(words.length, 80) * 0.2)));
  const confidenceScore = Math.max(0, Math.min(100, Math.round((clarityScore + paceScore + structureScore + deliveryScore) / 4)));

  return { wordCount: words.length, fillerCount, wpm, sentenceCount, structureSignals, paceFeedback, fillerFeedback, structureFeedback, clarityScore, paceScore, structureScore, deliveryScore, confidenceScore };
}

function speakFeedback(analysis) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const lines = [
    `Session complete. Here is your feedback.`,
    `Confidence score: ${analysis.confidenceScore} percent.`,
    `Clarity score: ${analysis.clarityScore} percent.`,
    `Structure score: ${analysis.structureScore} percent.`,
    `Delivery score: ${analysis.deliveryScore} percent.`,
    analysis.paceFeedback,
    analysis.fillerFeedback,
    analysis.structureFeedback,
    `Well done. Press Start New Practice to go again.`,
  ];
  const utterance = new SpeechSynthesisUtterance(lines.join(" "));
  utterance.lang = "en-GB";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export default function ProfessionalSpeakerTrainerApp() {
  const [selectedModeId, setSelectedModeId] = useState("professional-intro");
  const selectedMode = modes.find((m) => m.id === selectedModeId) || modes[0];
  const [customPrompt, setCustomPrompt] = useState(selectedMode.prompt);
  const [secondsLeft, setSecondsLeft] = useState(selectedMode.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [showMindBlank, setShowMindBlank] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("practice");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  const elapsedSeconds = selectedMode.duration - secondsLeft;
  const analysis = useMemo(() => analyseTranscript(transcript, Math.max(elapsedSeconds, 1)), [transcript, elapsedSeconds]);

  useEffect(() => {
    const stored = localStorage.getItem("speakerTrainerSessions");
    if (stored) { try { setSessions(JSON.parse(stored)); } catch { setSessions([]); } }
  }, []);

  useEffect(() => { localStorage.setItem("speakerTrainerSessions", JSON.stringify(sessions)); }, [sessions]);

  useEffect(() => {
    setCustomPrompt(selectedMode.prompt);
    setSecondsLeft(selectedMode.duration);
    setIsRunning(false);
  }, [selectedModeId]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      setHasFinished(true);
      stopListening();
      speakFeedback(analysis);
      return;
    }
    const interval = setInterval(() => setSecondsLeft((v) => v - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSpeechSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
      }
      if (finalText) setTranscript((c) => `${c} ${finalText}`.replace(/\s+/g, " ").trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  function startListening() {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setIsListening(true); } catch { setIsListening(true); }
  }
  function stopListening() {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    setIsListening(false);
  }
  function startPractice() { setIsRunning(true); setHasFinished(false); startListening(); }
  function pausePractice() { setIsRunning(false); stopListening(); }
  function resetPractice() {
    setIsRunning(false); setHasFinished(false); setShowMindBlank(false);
    stopListening(); setSecondsLeft(selectedMode.duration); setTranscript(""); setNotes("");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
  function randomPrompt() { setCustomPrompt(extraPrompts[Math.floor(Math.random() * extraPrompts.length)]); }
  function saveSession() {
    const newSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      mode: selectedMode.title,
      prompt: customPrompt,
      transcript,
      notes,
      analysis,
      elapsedSeconds,
    };
    setSessions((c) => [newSession, ...c].slice(0, 30));
    setHasFinished(false);
    setSecondsLeft(selectedMode.duration);
    setTranscript("");
    setNotes("");
  }

  const todaySessions = sessions.filter((s) => s.date.slice(0, 10) === getTodayKey()).length;
  const averageConfidence = sessions.length ? Math.round(sessions.reduce((sum, s) => sum + (s.analysis?.confidenceScore || 0), 0) / sessions.length) : 0;
  const bestSession = sessions.reduce((best, s) => (!best || (s.analysis?.confidenceScore || 0) > (best.analysis?.confidenceScore || 0) ? s : best), null);

  return (
    <div className="app-shell">
      <div className="container">
        <header className="app-header">
          <div className="header-inner">
            <div className="header-text">
              <div className="badge"><Sparkles size={16} /> Professional Speaking Coach</div>
              <h1>Build confidence, structure your thoughts, and recover when your mind goes blank.</h1>
              <p>Practise short speaking drills, use clear frameworks, track filler words, and save your progress after each session.</p>
            </div>
            <div className="stat-grid">
              <StatCard label="Today" value={todaySessions} icon={<CheckCircle2 size={18} />} />
              <StatCard label="Average" value={`${averageConfidence}%`} icon={<BarChart3 size={18} />} />
              <StatCard label="Saved" value={sessions.length} icon={<Trophy size={18} />} />
            </div>
          </div>
        </header>

        <nav className="tab-nav">
          {[["practice", "Practice Room", Mic], ["interview", "Interview Mode", MessageSquare], ["recovery", "Mind Blank Rescue", Brain], ["library", "Phrase Library", Timer], ["progress", "Progress", BarChart3]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`tab-btn${activeTab === id ? " active" : ""}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {activeTab === "practice" && (
          <main className="practice-layout">
            <section className="card drill-list">
              <h2 className="section-title"><ClipboardList size={22} /> Choose your drill</h2>
              <div className="mode-list">
                {modes.map((mode) => (
                  <button key={mode.id} onClick={() => setSelectedModeId(mode.id)} className={`mode-btn${selectedModeId === mode.id ? " selected" : ""}`}>
                    <div className="mode-btn-top">
                      <span className="mode-btn-title">{mode.title}</span>
                      <span className="mode-btn-time">{formatTime(mode.duration)}</span>
                    </div>
                    <p className="mode-btn-goal">{mode.goal}</p>
                    <p className="mode-btn-level">{mode.level}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="practice-right">
              {/* Session finished banner */}
              {hasFinished && (
                <div className="finished-banner">
                  <div className="finished-inner">
                    <CheckCircle2 size={28} className="finished-icon" />
                    <div>
                      <p className="finished-title">Session complete! Listening to feedback now…</p>
                      <p className="finished-sub">Your scores are updated below. Save your session or start a new practice.</p>
                    </div>
                  </div>
                  <div className="btn-row">
                    <button className="btn-save" onClick={saveSession}><Save size={16} /> Save &amp; Start New Practice</button>
                    <button className="btn-ghost" onClick={resetPractice}><RotateCcw size={16} /> Discard &amp; Reset</button>
                    <button className="btn-ghost" onClick={() => { if (window.speechSynthesis) window.speechSynthesis.cancel(); }}><Volume2 size={16} /> Stop Speaking</button>
                  </div>
                </div>
              )}

              {/* Mind blank overlay */}
              {showMindBlank && (
                <div className="mind-blank-overlay">
                  <div className="mind-blank-header">
                    <span className="mind-blank-title"><Brain size={20} /> Mind Blank — use one of these:</span>
                    <button className="btn-ghost small" onClick={() => setShowMindBlank(false)}>✕ Close</button>
                  </div>
                  <div className="mind-blank-phrases">
                    {recoveryPhrases.map((phrase) => (
                      <button key={phrase} className="mind-blank-phrase" onClick={() => setShowMindBlank(false)}>
                        "{phrase}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="card">
                  <div className="practice-top">
                    <div>
                      <h2 className="mode-heading">{selectedMode.title}</h2>
                      <p className="mode-goal">{selectedMode.goal}</p>
                    </div>
                    <div className="timer-box">
                      <div className="timer-label">{hasFinished ? "Finished" : isRunning ? "Running" : "Timer"}</div>
                      <div className={`timer-value${hasFinished ? " timer-done" : ""}`}>{formatTime(secondsLeft)}</div>
                    </div>
                  </div>

                <div className="practice-body">
                  <div className="prompt-col">
                    <label className="field-label">Speaking prompt</label>
                    <textarea className="field-textarea" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} />
                    <div className="btn-row">
                      <button className="btn-ghost" onClick={randomPrompt}>Generate prompt</button>
                      <button className="btn-primary" onClick={startPractice} disabled={isRunning}><Play size={16} /> Start</button>
                      <button className="btn-ghost" onClick={pausePractice}><Pause size={16} /> Pause</button>
                      <button className="btn-ghost" onClick={resetPractice}><RotateCcw size={16} /> Reset</button>
                      <button className="btn-mind-blank" onClick={() => setShowMindBlank(true)}><Brain size={16} /> Mind Blank</button>
                      {!hasFinished && <button className="btn-save" onClick={saveSession}><Save size={16} /> Save session</button>}
                    </div>
                    {!speechSupported && <div className="alert-amber">Speech recognition is not supported in this browser. You can still type your transcript manually.</div>}
                    {speechSupported && (
                      <div className="mic-status">
                        {isListening ? <Volume2 size={16} className="pulse" /> : <Mic size={16} />}
                        {isListening ? "Listening and transcribing..." : "Speech recognition is ready. Press Start and speak clearly."}
                      </div>
                    )}
                  </div>

                  <div className="structure-box">
                    <h3 className="structure-title">Use this structure</h3>
                    <ol className="structure-list">
                      {selectedMode.structure.map((step, i) => (
                        <li key={step} className="structure-item">
                          <span className="step-num">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

                <div className="two-col">
                  <div className="card">
                    <h3 className="section-title"><Mic size={20} /> Transcript</h3>
                    <textarea className="field-textarea transcript-large" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Your speech will appear here as you speak. You can also type or edit it manually." />
                  </div>

                  <div className="card">
                    <h3 className="section-title"><BarChart3 size={20} /> Speaking scorecard</h3>
                    <div className="score-grid four">
                      <ScoreBox label="Confidence" value={analysis.confidenceScore} />
                      <ScoreBox label="Clarity" value={analysis.clarityScore} />
                      <ScoreBox label="Structure" value={analysis.structureScore} />
                      <ScoreBox label="Delivery" value={analysis.deliveryScore} />
                    </div>
                  <div className="metric-row">
                    <Metric label="Words" value={analysis.wordCount} />
                    <Metric label="WPM" value={analysis.wpm} />
                    <Metric label="Fillers" value={analysis.fillerCount} />
                  </div>
                  <div className="feedback-list">
                    <FeedbackItem text={analysis.paceFeedback} />
                    <FeedbackItem text={analysis.fillerFeedback} />
                    <FeedbackItem text={analysis.structureFeedback} />
                  </div>
                  <textarea className="field-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write one improvement target. Example: I will pause before answering and use three clear points." />
                </div>
              </div>
            </section>
          </main>
        )}

        {activeTab === "recovery" && <RecoveryRoom />}
        {activeTab === "interview" && <InterviewRoom />}
        {activeTab === "library" && <PhraseLibrary />}
        {activeTab === "progress" && <ProgressRoom sessions={sessions} bestSession={bestSession} setSessions={setSessions} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ScoreBox({ label, value }) {
  return (
    <div className="score-box">
      <div className="score-value">{value}%</div>
      <div className="score-label">{label}</div>
      <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-box">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

function FeedbackItem({ text }) {
  return (
    <div className="feedback-item">
      <AlertCircle size={18} className="feedback-icon" />
      <span>{text}</span>
    </div>
  );
}

function RecoveryRoom() {
  const [selectedPhrase, setSelectedPhrase] = useState(recoveryPhrases[0]);
  return (
    <div className="recovery-layout">
      <section className="card">
        <h2 className="section-title"><Brain size={24} /> Mind Blank Rescue Method</h2>
        <p className="sub-text">When you lose your words, do not panic. Use a short pause, breathe, then restart with a clear bridge phrase.</p>
        <div className="recovery-steps">
          {[["1","Pause","Stop for two seconds. Silence is better than panic."],["2","Breathe","Take one slow breath. Relax your shoulders."],["3","Bridge","Use a prepared sentence to regain control."],["4","Continue","Return to your main point using a simple structure."]].map(([n, title, text]) => (
            <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="recovery-step">
              <div className="step-circle">{n}</div>
              <h3 className="step-title">{title}</h3>
              <p className="step-text">{text}</p>
            </motion.div>
          ))}
        </div>
        <div className="phrase-practice card-inner">
          <h3 className="section-title">Practise this recovery phrase</h3>
          <p className="phrase-display">"{selectedPhrase}"</p>
          <div className="btn-row">
            {recoveryPhrases.map((phrase) => (
              <button key={phrase} onClick={() => setSelectedPhrase(phrase)} className="btn-ghost">Use phrase</button>
            ))}
          </div>
        </div>
      </section>
      <aside className="card">
        <h3 className="section-title">Daily confidence drill</h3>
        <div className="drill-list-items">
          {["Stand up and breathe slowly for 10 seconds.","Say your first sentence twice before continuing.","Speak in three points: first, second, finally.","Pause for two seconds after each point.","End with one strong summary sentence."].map((item) => (
            <div key={item} className="drill-item"><CheckCircle2 size={18} className="shrink-0" /> {item}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function InterviewRoom() {
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState([]);
  const q = interviewQuestions[current];
  return (
    <div className="interview-layout">
      <section className="card">
        <h2 className="section-title"><MessageSquare size={24} /> Interview Mode</h2>
        <p className="sub-text">Practise real interview questions. Take your time, speak clearly, and use the STAR structure.</p>
        <div className="interview-progress">
          {interviewQuestions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`interview-dot${i === current ? " active" : ""}${answered.includes(i) ? " done" : ""}`}>
              {answered.includes(i) ? <CheckCircle2 size={14} /> : i + 1}
            </button>
          ))}
        </div>
        <div className="interview-card">
          <div className="interview-q-num">Question {current + 1} of {interviewQuestions.length}</div>
          <p className="interview-q">{q.q}</p>
          <div className="interview-hint"><span>Structure:</span> {q.hint}</div>
          <div className="interview-timing">Suggested time: {q.duration} seconds</div>
        </div>
        <div className="btn-row" style={{marginTop:"1rem"}}>
          <button className="btn-primary" onClick={() => { if (!answered.includes(current)) setAnswered(a => [...a, current]); setCurrent(c => Math.min(c + 1, interviewQuestions.length - 1)); }}>
            Next question
          </button>
          <button className="btn-ghost" onClick={() => { setAnswered([]); setCurrent(0); }}>Restart</button>
        </div>
      </section>
      <aside className="card">
        <h3 className="section-title"><Brain size={22} /> Interview tips</h3>
        <div className="drill-list-items">
          {["Pause for 2 seconds before answering.","Open every answer with a clear first sentence.","Use STAR structure for behavioural questions.","End with the result and what you learned.","Speak at 120–150 words per minute.","Avoid starting sentences with \"So\" or \"Um\".","Make eye contact with the camera, not the screen."].map((tip) => (
            <div key={tip} className="drill-item"><CheckCircle2 size={16} className="shrink-0" /> {tip}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function PhraseLibrary() {

  return (
    <div className="two-col">
      <section className="card">
        <h2 className="section-title"><MessageSquare size={24} /> Professional speaking phrases</h2>
        <p className="sub-text">Use these phrases to sound structured, confident, and clear.</p>
        <div className="phrase-list">
          {powerPhrases.map((phrase) => (
            <div key={phrase} className="phrase-item">{phrase}</div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2 className="section-title"><Timer size={24} /> 7-day training plan</h2>
        <p className="sub-text">Short daily practice beats long infrequent sessions.</p>
        <div className="plan-list">
          {[["Day 1","60-second professional introduction"],["Day 2","STAR answer — describe a time you improved quality"],["Day 3","Meeting update — progress, risk, next steps"],["Day 4","Data explanation to a non-technical manager"],["Day 5","Presentation opening — hook, topic, why it matters"],["Day 6","Mind blank recovery — practise your bridge phrases"],["Day 7","Full mock interview — answer 3 questions in sequence"]].map(([day, task]) => (
            <div key={day} className="plan-item">
              <div className="plan-day">{day}</div>
              <div className="plan-task">{task}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgressRoom({ sessions, bestSession, setSessions }) {
  return (
    <section className="card">
      <div className="progress-header">
        <div>
          <h2 className="section-title"><Trophy size={24} /> Your progress</h2>
          <p className="sub-text">Save your practice sessions and review what improved.</p>
        </div>
        <button className="btn-ghost" onClick={() => setSessions([])}>Clear saved sessions</button>
      </div>
      {bestSession && (
        <div className="best-session">
          <h3 className="best-label">Best session</h3>
          <p className="best-detail">{bestSession.mode} — {bestSession.analysis?.confidenceScore || 0}% confidence score</p>
        </div>
      )}
      <div className="session-list">
        {sessions.length === 0 && <div className="empty-state">No saved sessions yet. Complete one practice session and press Save session.</div>}
        {sessions.map((session) => (
          <article key={session.id} className="session-card">
            <div className="session-inner">
              <div>
                <h3 className="session-mode">{session.mode}</h3>
                <p className="session-date">{new Date(session.date).toLocaleString()}</p>
                <p className="session-prompt">{session.prompt}</p>
              </div>
              <div className="metric-row">
                <Metric label="Score" value={`${session.analysis?.confidenceScore || 0}%`} />
                <Metric label="WPM" value={session.analysis?.wpm || 0} />
                <Metric label="Fillers" value={session.analysis?.fillerCount || 0} />
              </div>
            </div>
            {session.notes && <p className="session-notes">Improvement target: {session.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
