const rohanPriyaEvaluations = [
  {
    cycle: 'cycle-may-2026',
    status: 'SUBMITTED',
    date: '2026-05-28 14:00:00',
    scores: [5, 4, 5, 4, 5],
    comments: [
      "Exceptional ownership on ERP project.",
      "Clear weekly updates.",
      "Quality standards maintained.",
      "Unblocked bottlenecks.",
      "Great team support."
    ]
  },
  {
    cycle: 'cycle-june-2026',
    status: 'SUBMITTED',
    date: '2026-06-27 16:30:00',
    scores: [4, 5, 5, 5, 4],
    comments: [
      "Delivered sprint scope on schedule.",
      "Proactive risk updates.",
      "Flawless migration execution.",
      "Designed innovative caching.",
      "Helpful peer support."
    ]
  },
  {
    cycle: 'cycle-july-2026',
    status: 'SUBMITTED',
    date: '2026-07-20 11:15:00',
    scores: [5, 5, 4, 5, 5],
    comments: [
      "Spearheaded logistics module.",
      "Transparent communication.",
      "Solid work quality.",
      "Resolved inventory latency.",
      "Fosters continuous learning."
    ]
  }
];

const ashokaTeamMembers = [
  { id: 'ashoka-emp-1', name: 'Arun Kumar', mayScore: [4, 4, 5, 4, 4], juneScore: [4, 5, 5, 4, 5], julyScore: [5, 5, 5, 4, 5], julyPending: false },
  { id: 'ashoka-emp-2', name: 'Deepa Roy', mayScore: [5, 4, 4, 5, 4], juneScore: [5, 5, 4, 5, 5], julyScore: [5, 4, 5, 5, 5], julyPending: false },
  { id: 'ashoka-emp-3', name: 'Karthik V', mayScore: [3, 4, 4, 3, 4], juneScore: [4, 4, 4, 4, 4], julyScore: [4, 4, 5, 4, 4], julyPending: false },
  { id: 'ashoka-emp-4', name: 'Meera Joshi', mayScore: [4, 5, 4, 5, 4], juneScore: [5, 5, 5, 5, 4], julyScore: [5, 5, 5, 5, 5], julyPending: false },
  { id: 'ashoka-emp-5', name: 'Suresh Pillai', mayScore: [4, 3, 4, 4, 4], juneScore: [4, 4, 4, 3, 4], julyScore: null, julyPending: true },
  { id: 'ashoka-emp-6', name: 'Anita Das', mayScore: [5, 4, 5, 4, 5], juneScore: [4, 4, 5, 5, 4], julyScore: null, julyPending: true }
];

const genericRationales = [
  [
    "Took full ownership of feature modules.",
    "Active participant in code reviews.",
    "Code quality was thorough and well-tested.",
    "Troubleshot edge case bugs effectively.",
    "Great team spirit during sprint crunches."
  ],
  [
    "Demonstrated strong self-direction.",
    "Kept design docs updated and clear.",
    "High craft standards on UI implementation.",
    "Found clever solution for responsive layout issues.",
    "Always willing to assist teammates."
  ],
  [
    "Consistently met sprint deadlines.",
    "Communicates roadblock early.",
    "Rigorous automated testing coverage.",
    "Analyzed performance logs deeply.",
    "Constructive peer feedback."
  ],
  [
    "Exceeded expectations on data pipeline delivery.",
    "Proactive status reporting.",
    "Clean, modular code structure.",
    "Formulated scalable database schema.",
    "Promoted knowledge sharing."
  ]
];

const bpConsultants = [
  { id: 'bp-consult-1', name: 'Ananya Sengupta', julySubmitted: true, scores: [5, 5, 4, 5, 5] },
  { id: 'bp-consult-2', name: 'Dev Malhotra', julySubmitted: true, scores: [4, 4, 5, 4, 4] },
  { id: 'bp-consult-3', name: 'Ishaan Kapoor', julySubmitted: true, scores: [5, 4, 5, 5, 4] },
  { id: 'bp-consult-4', name: 'Neha Verma', julySubmitted: true, scores: [4, 5, 4, 4, 5] },
  { id: 'bp-consult-5', name: 'Rahul Rao', julySubmitted: true, scores: [5, 4, 5, 4, 4] },
  { id: 'bp-consult-6', name: 'Riya Saxena', julySubmitted: false, scores: null },
  { id: 'bp-consult-7', name: 'Siddharth Jain', julySubmitted: false, scores: null },
  { id: 'bp-consult-8', name: 'Tanvi Bhatt', julySubmitted: false, scores: null }
];

module.exports = {
  rohanPriyaEvaluations,
  ashokaTeamMembers,
  genericRationales,
  bpConsultants
};
