import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
} from "lucide-react";

const modes = [
  {
    id: "professional-intro",
    title: "Professional Introduction",
    guideDuration: 90,
    level: "Beginner",
    category: "interview",
    goal: "Introduce yourself clearly in interviews, meetings, and networking situations.",
    structure: ["Who you are", "What you do", "Your strongest skill", "The value you bring"],
    prompt:
      "Introduce yourself as a data analyst and policy researcher. Make it clear, confident, and relevant to a professional audience.",
  },
  {
    id: "star-answer",
    title: "STAR Interview Answer",
    guideDuration: 180,
    level: "Intermediate",
    category: "interview",
    goal: "Answer behavioural interview questions with structure and impact.",
    structure: ["Situation", "Task", "Action", "Result", "Learning"],
    prompt:
      "Tell me about a time you improved the quality of a report, dataset, or service. Use the STAR structure.",
  },
  {
    id: "meeting-update",
    title: "Meeting Update",
    guideDuration: 120,
    level: "Beginner",
    category: "executive",
    goal: "Speak clearly when giving updates to managers or colleagues.",
    structure: ["Progress", "Key issue", "Action needed", "Next step"],
    prompt:
      "Give a short update on a project you are working on. Explain progress, risks, and next steps.",
  },
  {
    id: "data-briefing",
    title: "Data and Policy Briefing",
    guideDuration: 150,
    level: "Intermediate",
    category: "data-policy",
    goal: "Explain evidence, findings, and recommendations to a non-technical audience.",
    structure: ["Headline finding", "Evidence", "Why it matters", "Recommendation"],
    prompt:
      "Brief a senior manager on a key data finding. Explain the evidence, implication, limitation, and recommended next step.",
  },
  {
    id: "presentation-opening",
    title: "Presentation Opening",
    guideDuration: 120,
    level: "Intermediate",
    category: "presentation",
    goal: "Start presentations with confidence and authority.",
    structure: ["Greeting", "Topic", "Why it matters", "What you will cover"],
    prompt:
      "Open a short presentation on why good data quality matters in public policy and decision-making.",
  },
  {
    id: "mind-blank-recovery",
    title: "Mind Blank Recovery",
    guideDuration: 60,
    level: "Confidence Builder",
    category: "confidence",
    goal: "Recover calmly when you forget your words mid-speech.",
    structure: ["Pause", "Breathe", "Repeat the question", "Bridge back to your point"],
    prompt:
      "Practise recovering after forgetting your point. Pause, breathe, and restart using one of the recovery phrases.",
  },
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

const fillerWords = ["um", "uh", "erm", "like", "basically", "actually", "you know", "sort of", "kind of", "right"];

const professionalPhraseBanks = {
  interview: [
    "The situation I faced was...",
    "My responsibility was to...",
    "The action I took was...",
    "The result was measurable because...",
    "The key learning I took from this was...",
  ],
  "data-policy": [
    "The evidence suggests that...",
    "The key finding is...",
    "The practical implication is...",
    "A limitation of this analysis is...",
    "My recommendation is...",
  ],
  presentation: [
    "Today, I will focus on three key points...",
    "This matters because...",
    "The main message for decision-makers is...",
    "I will start with the context, then move to the evidence...",
    "By the end, you should have a clear view of...",
  ],
  executive: [
    "The current position is...",
    "The main risk is...",
    "The decision required is...",
    "The next step should be...",
    "My recommendation is based on...",
  ],
  confidence: [
    "Let me take that step by step.",
    "The key point is...",
    "I will break my answer into three parts.",
    "Let me return to the main issue.",
    "In summary, my answer is...",
  ],
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function detectWeakPhrases(transcript) {
  const sentences = transcript
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8)
    .slice(0, 12);

  const candidates = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    return (
      lower.includes("i think") ||
      lower.includes("i am good") ||
      lower.includes("i can") ||
      lower.includes("i do") ||
      lower.includes("things") ||
      lower.includes("stuff") ||
      lower.includes("basically") ||
      lower.includes("actually") ||
      lower.length < 90
    );
  });

  const chosen = (candidates.length ? candidates : sentences).slice(0, 4);

  return chosen.map((sentence) => ({
    original: sentence,
    improved: reframeSentence(sentence),
  }));
}

function reframeSentence(sentence) {
  const lower = sentence.toLowerCase();

  if (lower.includes("i am good") || lower.includes("i'm good")) {
    return "I have practical experience applying this skill to deliver clear, evidence-based outcomes.";
  }

  if (lower.includes("i do data") || lower.includes("data analysis")) {
    return "I analyse data to identify trends, explain evidence clearly, and support better decision-making.";
  }

  if (lower.includes("i can")) {
    return sentence.replace(/\bi can\b/i, "I am able to") + ", with a clear focus on accuracy, impact, and practical delivery.";
  }

  if (lower.includes("i think")) {
    return sentence.replace(/\bi think\b/i, "The evidence suggests") + ".";
  }

  if (lower.includes("basically") || lower.includes("actually")) {
    return sentence.replace(/\b(basically|actually)\b/gi, "").replace(/\s+/g, " ").trim() + ".";
  }

  if (lower.includes("things") || lower.includes("stuff")) {
    return sentence.replace(/things|stuff/gi, "specific tasks, evidence, and outcomes") + ".";
  }

  return `A stronger version would be: ${sentence}. The key value is that this supports clearer decisions and measurable outcomes.`;
}

function analyseTranscript(transcript, elapsedSeconds) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const lower = transcript.toLowerCase();
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  const wpm = elapsedSeconds > 0 ? Math.round((words.length / elapsedSeconds) * 60) : 0;
  const sentenceCount = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const structureSignals = [
    "first",
    "second",
    "third",
    "finally",
    "because",
    "therefore",
    "in summary",
    "my recommendation",
    "the key",
    "situation",
    "task",
    "action",
    "result",
    "evidence",
    "next step",
  ].filter((signal) => lower.includes(signal)).length;

  const professionalSignals = [
    "evidence",
    "insight",
    "recommendation",
    "stakeholder",
    "decision",
    "quality",
    "risk",
    "outcome",
    "impact",
    "analysis",
  ].filter((signal) => lower.includes(signal)).length;

  let paceFeedback = "Start speaking to calculate your pace.";
  if (wpm > 0 && wpm < 110) paceFeedback = "Your pace may be too slow. Add energy and reduce long gaps.";
  if (wpm >= 110 && wpm <= 160) paceFeedback = "Your pace is strong and professional.";
  if (wpm > 160) paceFeedback = "Your pace may be too fast. Slow down and use short pauses.";

  let fillerFeedback = "No transcript yet.";
  if (words.length > 0 && fillerCount <= 2) fillerFeedback = "Good control of filler words.";
  if (fillerCount > 2 && fillerCount <= 6) fillerFeedback = "Some filler words detected. Use pauses instead of rushing.";
  if (fillerCount > 6) fillerFeedback = "High filler word use. Practise pausing silently for two seconds.";

  let structureFeedback = "Use signposting words to guide your listener.";
  if (structureSignals >= 3) structureFeedback = "Good structure. You used helpful signposting language.";

  const structureScore = Math.min(100, Math.round(45 + structureSignals * 10 + Math.min(sentenceCount, 8) * 3));
  const professionalLanguageScore = Math.min(100, Math.round(45 + professionalSignals * 8 - fillerCount * 2));
  const clarityScore = Math.min(100, Math.round(45 + Math.min(words.length, 160) * 0.18 + structureSignals * 6 + professionalSignals * 4 - fillerCount * 3));
  const paceScore = wpm >= 110 && wpm <= 160 ? 90 : wpm === 0 ? 0 : wpm < 110 ? 62 : 58;
  const deliveryScore = Math.max(0, Math.min(100, Math.round((paceScore + Math.max(35, 95 - fillerCount * 7) + structureScore) / 3)));
  const confidenceScore = Math.max(0, Math.min(100, Math.round((clarityScore + paceScore + structureScore + deliveryScore) / 4)));

  return {
    wordCount: words.length,
    fillerCount,
    wpm,
    sentenceCount,
    structureSignals,
    professionalSignals,
    paceFeedback,
    fillerFeedback,
    structureFeedback,
    clarityScore,
    paceScore,
    structureScore,
    deliveryScore,
    professionalLanguageScore,
    confidenceScore,
  };
}

function getMainImprovementArea(analysis) {
  const areas = [
    { name: "Pace", score: analysis.paceScore, reason: analysis.wpm < 110 ? "You are speaking below the professional pace range." : "Your pace needs smoother control." },
    { name: "Structure", score: analysis.structureScore, reason: "Use clear signposting such as first, second, finally, result, and recommendation." },
    { name: "Clarity", score: analysis.clarityScore, reason: "Use shorter sentences and make your main point earlier." },
    { name: "Delivery", score: analysis.deliveryScore, reason: "Use stronger energy, steady rhythm, and confident pauses." },
    { name: "Professional language", score: analysis.professionalLanguageScore, reason: "Use more evidence-based, outcome-focused language." },
    { name: "Filler words", score: Math.max(0, 100 - analysis.fillerCount * 12), reason: "Replace filler words with a short silent pause." },
  ];

  return areas.sort((a, b) => a.score - b.score)[0];
}

function getProgressVerdict(currentAnalysis, sessions) {
  const previous = sessions.slice(0, 5).filter((session) => session.analysis);

  if (!previous.length) {
    return {
      status: "baseline",
      title: "This is your baseline session",
      tone: "amber",
      message: "Save a few more sessions so the app can measure your communication progress properly.",
    };
  }

  const avg = (key) => Math.round(previous.reduce((sum, session) => sum + (session.analysis?.[key] || 0), 0) / previous.length);
  const previousConfidence = avg("confidenceScore");
  const previousClarity = avg("clarityScore");
  const previousStructure = avg("structureScore");
  const previousWpm = avg("wpm");
  const previousFillers = avg("fillerCount");

  const scoreGain = currentAnalysis.confidenceScore - previousConfidence;
  const clarityGain = currentAnalysis.clarityScore - previousClarity;
  const structureGain = currentAnalysis.structureScore - previousStructure;
  const fillerGain = previousFillers - currentAnalysis.fillerCount;
  const paceImproved = Math.abs(135 - currentAnalysis.wpm) < Math.abs(135 - previousWpm);

  const positiveSignals = [scoreGain >= 3, clarityGain >= 3, structureGain >= 3, fillerGain >= 1, paceImproved].filter(Boolean).length;
  const negativeSignals = [scoreGain <= -5, clarityGain <= -5, structureGain <= -5, fillerGain <= -2].filter(Boolean).length;

  if (positiveSignals >= 3) {
    return {
      status: "improving",
      title: "You are improving",
      tone: "green",
      message: `Your confidence is ${scoreGain >= 0 ? "+" : ""}${scoreGain} points versus your recent average. Your clarity changed by ${clarityGain >= 0 ? "+" : ""}${clarityGain}, structure by ${structureGain >= 0 ? "+" : ""}${structureGain}, and filler words changed by ${fillerGain >= 0 ? "-" : "+"}${Math.abs(fillerGain)}.`,
    };
  }

  if (negativeSignals >= 2) {
    return {
      status: "declining",
      title: "You need more focused practice",
      tone: "red",
      message: `Your latest score is ${Math.abs(scoreGain)} point${Math.abs(scoreGain) === 1 ? "" : "s"} below your recent average. Focus on one clear improvement target before your next session.`,
    };
  }

  return {
    status: "stable",
    title: "Your progress is stable",
    tone: "amber",
    message: "You are maintaining your level. To move forward, focus on one priority: structure your answer in three clear points.",
  };
}

function getRecommendedDrill(areaName) {
  const area = areaName.toLowerCase();
  if (area.includes("pace") || area.includes("delivery")) return "meeting-update";
  if (area.includes("structure")) return "star-answer";
  if (area.includes("professional")) return "data-briefing";
  if (area.includes("clarity")) return "professional-intro";
  if (area.includes("filler")) return "mind-blank-recovery";
  return "professional-intro";
}

function generateLiveCoachReport({ transcript, analysis, mode, sessions }) {
  const improvementArea = getMainImprovementArea(analysis);
  const reframes = detectWeakPhrases(transcript);
  const phraseBank = professionalPhraseBanks[mode.category] || professionalPhraseBanks.interview;
  const progress = getProgressVerdict(analysis, sessions);
  const recommendedDrillId = getRecommendedDrill(improvementArea.name);
  const recommendedDrill = modes.find((item) => item.id === recommendedDrillId) || modes[0];

  const coachMessage = `Good work. Your confidence is building. Your next target is ${improvementArea.name.toLowerCase()}. Practise ${recommendedDrill.title} and end with a clear summary sentence.`;

  return {
    improvementArea,
    reframes,
    phraseBank,
    progress,
    recommendedDrill,
    coachMessage,
    spokenSummary: `${progress.title}. ${progress.message}. Your main improvement area is ${improvementArea.name}. ${improvementArea.reason}. ${coachMessage}`,
  };
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export default function ProfessionalSpeakerTrainerApp() {
  const [selectedModeId, setSelectedModeId] = useState("professional-intro");
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) || modes[0];
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
  const recognitionRef = useRef(null);
  const finishedRef = useRef(false);
  const lastLiveMessageTime = useRef(0);
  const liveMessageTimeout = useRef(null);

  const analysis = useMemo(() => analyseTranscript(transcript, Math.max(elapsedSeconds, 1)), [transcript, elapsedSeconds]);

  useEffect(() => {
    const stored = localStorage.getItem("speakerTrainerSessions");
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        setSessions([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("speakerTrainerSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    setCustomPrompt(selectedMode.prompt);
    resetPractice(false);
  }, [selectedModeId]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || isFinished) return;

    if (elapsedSeconds - lastLiveMessageTime.current < 20) return;

    let newMessage = null;
    let newTone = "green";

    const halfTime = Math.floor(selectedMode.guideDuration / 2);
    const wrapUpTime = Math.floor(selectedMode.guideDuration * 0.8);

    if (analysis.wpm > 160) {
      newMessage = "Slow down slightly";
      newTone = "amber";
    } else if (elapsedSeconds > 20 && analysis.wpm < 110) {
      newMessage = "Add more energy";
      newTone = "amber";
    } else if (analysis.fillerCount > 3 && elapsedSeconds % 30 < 5) {
      newMessage = "Avoid filler words, pause instead";
      newTone = "amber";
    } else if (elapsedSeconds === 20) {
      newMessage = "Use three clear points";
      newTone = "green";
    } else if (elapsedSeconds === halfTime) {
      newMessage = "Give an example";
      newTone = "green";
    } else if (elapsedSeconds === wrapUpTime) {
      newMessage = "Move to your result";
      newTone = "green";
    } else if (elapsedSeconds === wrapUpTime + 10) {
      newMessage = "End with a recommendation";
      newTone = "green";
    }

    if (newMessage) {
      setLiveMessage({ text: newMessage, tone: newTone });
      lastLiveMessageTime.current = elapsedSeconds;
      
      if (liveMessageTimeout.current) clearTimeout(liveMessageTimeout.current);
      liveMessageTimeout.current = setTimeout(() => {
        setLiveMessage(null);
      }, 8000);
    }
  }, [elapsedSeconds, isRunning, isFinished, analysis, selectedMode.guideDuration]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

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
        setTranscript((current) => `${current} ${finalText}`.replace(/\s+/g, " ").trim());
      }

      if (/\bthank\s+you\b/i.test(fullDetectedText) && !finishedRef.current) {
        setTimeout(() => finishPractice("voice"), 500);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [selectedModeId, transcript, elapsedSeconds, sessions]);

  const todaySessions = sessions.filter((session) => session.date.slice(0, 10) === getTodayKey()).length;
  const averageConfidence = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + (session.analysis?.confidenceScore || 0), 0) / sessions.length)
    : 0;

  function startListening() {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(true);
    }
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Browser speech recognition can throw if already stopped.
    }
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

    const report = generateLiveCoachReport({
      transcript,
      analysis,
      mode: selectedMode,
      sessions,
    });

    setCoachReport(report);
    speakText(report.spokenSummary);
  }

  function resetPractice(clearTranscript = true) {
    setIsRunning(false);
    setIsFinished(false);
    finishedRef.current = false;
    stopListening();
    stopSpeaking();
    setElapsedSeconds(0);
    setCoachReport(null);
    setLiveMessage(null);
    lastLiveMessageTime.current = 0;
    if (liveMessageTimeout.current) clearTimeout(liveMessageTimeout.current);
    if (clearTranscript) {
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
    const report = coachReport || generateLiveCoachReport({ transcript, analysis, mode: selectedMode, sessions });
    const newSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      mode: selectedMode.title,
      modeId: selectedMode.id,
      prompt: customPrompt,
      transcript,
      notes,
      analysis,
      coachReport: report,
      elapsedSeconds,
    };
    setSessions((current) => [newSession, ...current].slice(0, 50));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                <Sparkles size={16} /> Professional Speaking Coach
              </div>
              <h1 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-5xl">
                Speak clearly, recover confidently, and track real communication progress.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Start speaking, end with “thank you”, and receive a Live Communication Coach report with reframes, progress feedback, and your next drill.
              </p>
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
                      <h3 className="font-bold text-sm">{mode.title}</h3>
                      <span className="shrink-0 rounded-full bg-slate-950/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Guide {formatTime(mode.guideDuration)}</span>
                    </div>
                    <p className={`mt-1.5 text-xs leading-relaxed ${selectedModeId === mode.id ? "text-slate-700" : "text-slate-400"}`}>{mode.goal}</p>
                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${selectedModeId === mode.id ? "text-slate-500" : "text-slate-500"}`}>{mode.level}</p>
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
                      Speak naturally. When you are finished, say <strong>“thank you”</strong> or press <strong>Finish Speaking</strong>. The timer will stop at your real speaking time.
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
                      onChange={(event) => setCustomPrompt(event.target.value)}
                      className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-base leading-relaxed text-slate-100 outline-none ring-0 focus:border-white/30"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={randomPrompt} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                        Generate prompt
                      </button>
                      <button onClick={startPractice} disabled={isRunning} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">
                        <Play size={16} /> Start
                      </button>
                      <button onClick={pausePractice} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                        <Pause size={16} /> Pause
                      </button>
                      <button onClick={() => finishPractice("button")} disabled={!isRunning && !transcript} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                        <CheckCircle2 size={16} /> Finish Speaking
                      </button>
                      <button onClick={() => setShowRecovery(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2 text-sm font-bold text-white hover:bg-violet-400">
                        <Brain size={16} /> Mind Blank
                      </button>
                      <button onClick={() => resetPractice(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                        <RotateCcw size={16} /> Reset
                      </button>
                      <button onClick={saveSession} disabled={!transcript} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
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
                <LiveCommunicationCoach report={coachReport} analysis={analysis} onPractice={() => practiseRecommendedDrill(coachReport.recommendedDrill.id)} />
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
                  <textarea
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Your speech transcript will appear here. You can also type it manually after practice."
                    className="min-h-[360px] w-full rounded-2xl border border-white/10 bg-slate-950 p-5 text-lg leading-relaxed text-slate-100 outline-none focus:border-white/30"
                  />
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
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Write one improvement target. Example: I will pause before answering and use three clear points."
                    className="mt-4 min-h-[100px] w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-100 outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </section>
          </main>
        )}

        {activeTab === "recovery" && <RecoveryRoom />}
        {activeTab === "library" && <PhraseLibrary />}
        {activeTab === "progress" && <ProgressRoom sessions={sessions} setSessions={setSessions} />}
      </div>

      {showRecovery && <MindBlankOverlay onClose={() => setShowRecovery(false)} />}
    </div>
  );
}

function LiveCommunicationCoach({ report, analysis, onPractice }) {
  const toneClasses = {
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    red: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  };

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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2">
          <h3 className="text-lg font-bold">Better way to say it</h3>
          <div className="mt-3 grid gap-3">
            {report.reframes.length === 0 && <p className="text-sm text-slate-400">Speak or type more text to receive reframe suggestions.</p>}
            {report.reframes.map((item, index) => (
              <div key={`${item.original}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You said</p>
                <p className="mt-1 text-sm text-slate-300">“{item.original}”</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">Better way to say it</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-emerald-100">“{item.improved}”</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-bold">Best language to use next</h3>
          <div className="mt-3 grid gap-2">
            {report.phraseBank.map((phrase) => (
              <div key={phrase} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200">
                {phrase}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-bold">Coach message</h3>
          <p className="mt-3 rounded-2xl bg-sky-400/10 p-4 text-sm leading-6 text-sky-100">{report.coachMessage}</p>
          <button onClick={onPractice} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200">
            <Play size={16} /> Practise Recommended Drill
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

function MindBlankOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Brain size={24} /> Mind Blank Recovery
        </h2>
        <p className="mt-2 text-slate-300">Pause. Breathe. Choose one phrase and continue calmly.</p>
        <div className="mt-5 grid gap-3">
          {recoveryPhrases.map((phrase) => (
            <button key={phrase} onClick={onClose} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-lg font-semibold hover:bg-white/10">
              “{phrase}”
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

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-200">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function ScoreBox({ label, value }) {
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

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function FeedbackItem({ text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function RecoveryRoom() {
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
          <p className="mt-4 rounded-2xl bg-white p-5 text-2xl font-bold leading-snug text-slate-950">“{selectedPhrase}”</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {recoveryPhrases.map((phrase) => (
              <button key={phrase} onClick={() => setSelectedPhrase(phrase)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
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

function PhraseLibrary() {
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

function ProgressRoom({ sessions, setSessions }) {
  const averageScore = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + (session.analysis?.confidenceScore || 0), 0) / sessions.length) : 0;
  const averageWpm = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + (session.analysis?.wpm || 0), 0) / sessions.length) : 0;
  const averageFillers = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + (session.analysis?.fillerCount || 0), 0) / sessions.length) : 0;
  const recent = sessions.slice(0, 10).reverse();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy size={24} /> Practice History Report
          </h2>
          <p className="mt-2 text-slate-300">Track whether your communication skill is improving, stable, or declining.</p>
        </div>
        <button onClick={() => setSessions([])} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
          Clear saved sessions
        </button>
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
              <div className="w-full rounded-t-xl bg-white" style={{ height: `${Math.max(8, session.analysis?.confidenceScore || 0)}%` }} />
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
                <p className="mt-1 text-sm text-slate-400">{new Date(session.date).toLocaleString()} · {formatTime(session.elapsedSeconds || 0)}</p>
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
            {session.notes && <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">Improvement target: {session.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function LiveCoachPrompt({ message }) {
  const toneClasses = {
    green: "border-emerald-400/30 bg-emerald-500 text-white",
    amber: "border-amber-400/30 bg-amber-400 text-slate-950",
    purple: "border-violet-400/30 bg-violet-500 text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`absolute right-4 top-4 z-10 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl sm:relative sm:right-auto sm:top-auto sm:mb-0 sm:mt-0 ${toneClasses[message.tone]}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
        <MessageCircle size={18} className={message.tone === "amber" ? "text-slate-950" : "text-white"} />
      </div>
      <p className="text-sm font-bold">{message.text}</p>
    </motion.div>
  );
}
