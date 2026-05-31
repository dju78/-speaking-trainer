export const modes = [
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

export const extraPrompts = [
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

export const recoveryPhrases = [
  "Let me pause for a moment and structure my answer clearly.",
  "The key point I want to make is this.",
  "To put that more clearly, my answer is in three parts.",
  "Let me return to the main point.",
  "That is an important question. I will start with the context, then explain my action.",
  "I want to make sure I answer that properly, so I will break it down.",
];

export const fillerWords = [
  "um", "uh", "erm", "like", "basically", "actually",
  "you know", "sort of", "kind of", "right",
];

export const professionalPhraseBanks = {
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

export const appFeedbackPhrases = [
  "your latest score is", "focus on one", "practise your latest score",
  "practice your latest score", "recent average", "you need more focus",
  "points below your recent average", "your confidence is building",
  "your next target is", "good work", "your pace is too fast",
  "your pace is too slow", "your pace is strong", "good control of filler words",
  "some filler words detected", "use signposting words", "good structure",
  "start speaking to calculate", "no transcript yet", "monitor progress",
  "progress up", "needs focus", "you are improving", "you are maintaining",
  "save a few more sessions", "good effort",
];

export const correctionRules = [
  [/\bhigher(?=[\s,]+my\s+name)/gi, "Hi,"],
  [/\bdalamalamayelil\b/gi, "Daramola Omoyele"],
  [/\bdaramola\s+omo\s*yele?\b/gi, "Daramola Omoyele"],
  [/\bdaramola\s+omoyali\b/gi, "Daramola Omoyele"],
  [/\bcanada\s+contact\b/gi, "chartered accountant"],
  [/\baccount\s+contact\b/gi, "chartered accountant"],
  [/\bcharter\s+accountant\b/gi, "chartered accountant"],
  [/\bchartered\s+account\b(?!ant)/gi, "chartered accountant"],
  [/\bi\s+good\s+in\b/gi, "I am skilled in"],
  [/\bi\s+good\s+at\b/gi, "I am skilled in"],
  [/\bbuilding\s+dashboard\b(?!s)/gi, "building dashboards"],
  [/\bdecision\s+making\s+support\b/gi, "decision-making support"],
  [/\bdecision\s+making\b/gi, "decision-making"],
  [/\bstake\s+holder\b/gi, "stakeholder"],
  [/\ban\s+an\s+/gi, "an "],
  [/\band\s+and\s+/gi, "and "],
  [/\bi\s+am\s+familiar\s+and\s+i\s+have\b/gi, "I have"],
  [/\ba\s+very\s+strong\s+background\b/gi, "a strong background"],
];

export const professionalTemplates = [
  { label: "Opening", text: "My name is..." },
  { label: "Background", text: "My professional background is in..." },
  { label: "Key strengths", text: "My key strengths are..." },
  { label: "Current role", text: "In my current role, I..." },
  { label: "Value", text: "The value I bring is..." },
  { label: "Closing", text: "Overall, I would describe myself as..." },
];

export const suggestedClosingSentence =
  "Overall, I bring strong analytical skills, attention to detail, and a clear focus on using data to improve decision-making.";
