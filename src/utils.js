import {
  appFeedbackPhrases,
  correctionRules,
  fillerWords,
  modes,
  professionalPhraseBanks,
  suggestedClosingSentence,
} from "./data.js";

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function cleanTranscript(rawText) {
  if (!rawText || rawText.trim().length < 5) return rawText || "";
  let text = rawText;
  for (const phrase of appFeedbackPhrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped + "[^.!?]*[.!?]?", "gi"), " ");
  }
  for (const [pattern, replacement] of correctionRules) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\b(\w+)\s+\1\b/gi, "$1");
  text = text.replace(/\s+/g, " ").trim();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text = text.replace(/([.!?]\s+)(\w)/g, (_m, sep, ch) => sep + ch.toUpperCase());
  text = text.replace(/\bi\b(?!')/g, "I");
  if (text.length > 10 && !/[.!?]$/.test(text.trim())) text = text.trim() + ".";
  return text;
}

export function generateProfessionalVersion(cleanText, mode) {
  if (!cleanText || cleanText.trim().split(/\s+/).length < 15) return "";
  const lower = cleanText.toLowerCase();
  if (mode?.category === "interview" || mode?.id === "professional-intro") {
    const parts = [];
    const nameMatch = cleanText.match(/(?:my name is|I am|I'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (nameMatch) parts.push(`Hi, my name is ${nameMatch[1]}.`);
    const roles = [];
    if (/economist/i.test(lower)) roles.push("economist");
    if (/data\s*analyst/i.test(lower)) roles.push("data analyst");
    if (/chartered\s*accountant/i.test(lower)) roles.push("chartered accountant");
    if (/policy/i.test(lower)) roles.push("policy researcher");
    if (roles.length > 0) {
      const r = roles.length > 1 ? roles.slice(0, -1).join(", ") + ", and " + roles[roles.length - 1] : roles[0];
      parts.push(`I am ${/^[aeiou]/i.test(r) ? "an" : "a"} ${r} with a strong background in statistical analysis, data visualisation, and evidence-based decision-making.`);
    }
    const skills = [];
    if (/quantitative/i.test(lower)) skills.push("analyse quantitative and qualitative data");
    if (/dashboard/i.test(lower)) skills.push("build dashboards");
    if (/trend|insight|analy/i.test(lower)) skills.push("identify trends");
    if (/stakeholder|communicat/i.test(lower)) skills.push("communicate insights clearly to support management decisions");
    if (skills.length > 0) parts.push(`In my current work, I ${skills.join(", ")}.`);
    const tools = [];
    if (/excel/i.test(lower)) tools.push("Excel");
    if (/power\s*bi/i.test(lower)) tools.push("Power BI");
    if (/python/i.test(lower)) tools.push("Python");
    if (/sql/i.test(lower)) tools.push("SQL");
    if (tools.length > 0) parts.push(`I am confident using ${tools.join(", ")}, and I have experience working with stakeholders to turn complex data into practical recommendations.`);
    parts.push(suggestedClosingSentence);
    if (parts.length >= 2) return parts.join("\n\n");
  }
  const sentences = cleanText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);
  if (sentences.length < 2) return "";
  return sentences
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .map((s) => (s.endsWith(".") ? s : s + "."))
    .join(" ");
}

export function analyseTranscript(transcript, elapsedSeconds) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const lower = transcript.toLowerCase();

  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  const wpm = elapsedSeconds > 0 ? Math.round((words.length / elapsedSeconds) * 60) : 0;
  const sentenceCount = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  const structureSignals = [
    "first", "second", "third", "finally", "because", "therefore",
    "in summary", "my recommendation", "the key", "situation", "task",
    "action", "result", "evidence", "next step",
  ].filter((signal) => lower.includes(signal)).length;

  const professionalSignals = [
    "evidence", "insight", "recommendation", "stakeholder", "decision",
    "quality", "risk", "outcome", "impact", "analysis",
  ].filter((signal) => lower.includes(signal)).length;

  let paceFeedback = "Start speaking to calculate your pace.";
  if (wpm > 0 && wpm < 110) paceFeedback = "Your pace is too slow. Add more energy and flow.";
  if (wpm >= 110 && wpm < 130) paceFeedback = "Slightly slow. Try adding a bit more energy.";
  if (wpm >= 130 && wpm <= 160) paceFeedback = "Good pace for a professional interview.";
  if (wpm > 160 && wpm <= 180) paceFeedback = "Slightly fast. Use short pauses between points.";
  if (wpm > 180) paceFeedback = "Your pace is too fast. Slow down and use short pauses.";

  let fillerFeedback = "No transcript yet.";
  if (words.length > 0 && fillerCount <= 2) fillerFeedback = "Good control of filler words.";
  if (fillerCount > 2 && fillerCount <= 6) fillerFeedback = "Some filler words detected. Use pauses instead of rushing.";
  if (fillerCount > 6) fillerFeedback = "High filler word use. Practise pausing silently for two seconds.";

  let structureFeedback = "Use signposting words to guide your listener.";
  if (structureSignals >= 3) structureFeedback = "Good structure. You used helpful signposting language.";

  const structureScore = Math.min(100, Math.round(45 + structureSignals * 10 + Math.min(sentenceCount, 8) * 3));
  const professionalLanguageScore = Math.min(100, Math.round(45 + professionalSignals * 8 - fillerCount * 2));
  const clarityScore = Math.min(100, Math.round(45 + Math.min(words.length, 160) * 0.18 + structureSignals * 6 + professionalSignals * 4 - fillerCount * 3));
  const paceScore = wpm >= 130 && wpm <= 160 ? 92 : wpm >= 110 && wpm < 130 ? 72 : wpm > 160 && wpm <= 180 ? 68 : wpm === 0 ? 0 : wpm < 110 ? 55 : 42;
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

export function detectWeakPhrases(transcript) {
  const sentences = transcript
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 12);

  const candidates = sentences.filter((s) => {
    const lower = s.toLowerCase();
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

  return (candidates.length ? candidates : sentences).slice(0, 4).map((sentence) => ({
    original: sentence,
    improved: reframeSentence(sentence),
  }));
}

function reframeSentence(sentence) {
  const lower = sentence.toLowerCase();
  if (lower.includes("i am good") || lower.includes("i'm good"))
    return "I have practical experience applying this skill to deliver clear, evidence-based outcomes.";
  if (lower.includes("i do data") || lower.includes("data analysis"))
    return "I analyse data to identify trends, explain evidence clearly, and support better decision-making.";
  if (lower.includes("i can"))
    return sentence.replace(/\bi can\b/i, "I am able to") + ", with a clear focus on accuracy, impact, and practical delivery.";
  if (lower.includes("i think"))
    return sentence.replace(/\bi think\b/i, "The evidence suggests") + ".";
  if (lower.includes("basically") || lower.includes("actually"))
    return sentence.replace(/\b(basically|actually)\b/gi, "").replace(/\s+/g, " ").trim() + ".";
  if (lower.includes("things") || lower.includes("stuff"))
    return sentence.replace(/things|stuff/gi, "specific tasks, evidence, and outcomes") + ".";
  return `A stronger version would be: ${sentence}. The key value is that this supports clearer decisions and measurable outcomes.`;
}

export function getMainImprovementArea(analysis) {
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

export function getProgressVerdict(currentAnalysis, sessions) {
  const previous = sessions.slice(0, 5).filter((s) => s.analysis);
  if (!previous.length) {
    return {
      status: "baseline",
      title: "This is your baseline session",
      tone: "amber",
      message: "Save a few more sessions so the app can measure your communication progress properly.",
    };
  }
  const avg = (key) => Math.round(previous.reduce((sum, s) => sum + (s.analysis?.[key] || 0), 0) / previous.length);
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

export function getRecommendedDrill(areaName) {
  const area = areaName.toLowerCase();
  if (area.includes("pace") || area.includes("delivery")) return "meeting-update";
  if (area.includes("structure")) return "star-answer";
  if (area.includes("professional")) return "data-briefing";
  if (area.includes("clarity")) return "professional-intro";
  if (area.includes("filler")) return "mind-blank-recovery";
  return "professional-intro";
}

export function generateLiveCoachReport({ transcript, analysis, mode, sessions }) {
  const improvementArea = getMainImprovementArea(analysis);
  const reframes = detectWeakPhrases(transcript);
  const phraseBank = professionalPhraseBanks[mode.category] || professionalPhraseBanks.interview;
  const progress = getProgressVerdict(analysis, sessions);
  const recommendedDrillId = getRecommendedDrill(improvementArea.name);
  const recommendedDrill = modes.find((m) => m.id === recommendedDrillId) || modes[0];

  const coachMessage =
    analysis.wpm > 180
      ? `Good effort. Your main improvement area is ${improvementArea.name.toLowerCase()}. Slow down, pause after your name, and speak in short professional sentences. Focus on clarity, structure, and a strong closing sentence.`
      : analysis.wpm > 0 && analysis.wpm < 110
      ? `Good effort. Your main improvement area is ${improvementArea.name.toLowerCase()}. Add more energy to your delivery. Speak with purpose and keep your sentences flowing. Practise ${recommendedDrill.title}.`
      : `Good effort. Your main improvement area is ${improvementArea.name.toLowerCase()}. Practise ${recommendedDrill.title} and end with a clear summary sentence. Focus on clarity, structure, and a strong closing.`;

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

export function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
