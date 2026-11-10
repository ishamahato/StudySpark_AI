import { StudySet } from "@/types/study";

export const SAMPLE_NOTES: { label: string; topic: string; notes: string }[] = [
  {
    label: "Biology: Cellular Respiration",
    topic: "Cellular Respiration & Energy",
    notes: `Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages of cellular respiration include glycolysis, pyruvate oxidation, the citric acid or Krebs cycle, and oxidative phosphorylation.
Glycolysis occurs in the cytosol and does not require oxygen (anaerobic). It breaks 1 glucose (6 carbons) into 2 pyruvates (3 carbons each), producing a net yield of 2 ATP and 2 NADH.
Pyruvate oxidation moves pyruvate into the mitochondrial matrix, converting it into Acetyl-CoA while releasing CO2 and producing NADH.
The Citric Acid Cycle (Krebs cycle) operates in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate (4C) to form citrate (6C). For each turn, it yields 3 NADH, 1 FADH2, 1 ATP/GTP, and 2 CO2.
Oxidative phosphorylation occurs on the inner mitochondrial membrane (cristae). It consists of the electron transport chain (ETC) and chemiosmosis. Electrons from NADH and FADH2 are transferred through complexes I-IV to oxygen (the final electron acceptor), forming water. Proton pumping generates a proton gradient across the inner membrane. ATP synthase uses this proton-motive force to synthesize approximately 26-28 ATP molecules.
Total theoretical yield per glucose is ~30 to 32 ATP.`,
  },
  {
    label: "CS: Operating Systems & Deadlocks",
    topic: "Operating Systems: Concurrency & Deadlocks",
    notes: `A deadlock is a situation in concurrent computing where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
There are four Coffman conditions that must hold simultaneously for a deadlock to occur:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources currently held by other processes.
3. No Preemption: Resources cannot be forcibly taken from a process holding them; they can only be released voluntarily.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain (P0 waits for P1, P1 waits for P2... Pn waits for P0).

Deadlock handling strategies:
- Prevention: Invalidate at least one of the four Coffman conditions (e.g. impose total ordering on resource acquisition to eliminate circular wait).
- Avoidance: Ensure system stays in a "safe state" using algorithms like Dijkstra's Banker's Algorithm.
- Detection and Recovery: Allow deadlocks to occur, run cycle detection on Resource Allocation Graphs, and recover via process termination or resource preemption.
- Ignorance: The Ostrich algorithm (pretend the problem never occurs, used in general-purpose OS when deadlocks are rare).`,
  },
  {
    label: "Psychology: Cognitive Biases",
    topic: "Cognitive Biases in Decision Making",
    notes: `Cognitive biases are systematic patterns of deviation from norm or rationality in judgment. They often result from heuristics—mental shortcuts used by the brain to facilitate quick decisions.
Key cognitive biases:
1. Confirmation Bias: The tendency to search for, interpret, favor, and recall information in a way that confirms or supports one's prior beliefs or values.
2. Availability Heuristic: Overestimating the likelihood of events that are easily remembered or vivid in memory, such as plane crashes vs car accidents.
3. Anchoring Bias: Relying too heavily on the first piece of information encountered (the "anchor") when making decisions, common in negotiations and retail pricing.
4. The Dunning-Kruger Effect: A cognitive bias where people with low ability at a task overestimate their competence, while experts may underestimate their relative superiority.
5. Sunk Cost Fallacy: Continuing an endeavor once an investment in money, effort, or time has been made, despite evidence that continuing is irrational.
6. Hindsight Bias: The "I knew it all along" phenomenon—viewing events as more predictable after they have occurred than before.`,
  },
];

export const MOCK_STUDY_SETS: Record<string, StudySet> = {
  cellular_respiration: {
    id: "mock_set_bio",
    title: "Cellular Respiration & ATP Production",
    topic: "Cellular Biology & Biochemistry",
    summary:
      "A comprehensive study set detailing the four metabolic stages of cellular respiration: Glycolysis, Pyruvate Oxidation, the Krebs Cycle, and Oxidative Phosphorylation.",
    sourceNotes: SAMPLE_NOTES[0].notes,
    createdAt: new Date().toISOString(),
    keyConcepts: [
      {
        term: "Glycolysis",
        definition: "Anaerobic cytoplasmic breakdown of glucose into 2 pyruvates, yielding net 2 ATP and 2 NADH.",
        category: "Metabolic Pathway",
      },
      {
        term: "Oxidative Phosphorylation",
        definition: "Mitochondrial membrane process using electron transport and ATP synthase to produce ~28 ATP.",
        category: "Bioenergetics",
      },
      {
        term: "Chemiosmosis",
        definition: "Movement of protons (H+) down their electrochemical gradient across ATP synthase to generate ATP.",
        category: "Mechanism",
      },
      {
        term: "Final Electron Acceptor",
        definition: "Molecular oxygen (O2), which accepts electrons and protons at complex IV to form water (H2O).",
        category: "Biochemistry",
      },
    ],
    flashcards: [
      {
        id: "fc_1",
        front: "Where does glycolysis occur within the cell?",
        back: "In the cytosol (cytoplasm) outside the mitochondria.",
        hint: "It does not require organelle membranes or oxygen.",
        concept: "Glycolysis",
        difficulty: "easy",
      },
      {
        id: "fc_2",
        front: "What is the net gain of ATP directly generated per glucose molecule from glycolysis?",
        back: "Net gain of 2 ATP (4 ATP produced minus 2 ATP consumed in the investment phase).",
        hint: "Remember the energy investment phase consumes 2 ATP.",
        concept: "Glycolysis",
        difficulty: "medium",
      },
      {
        id: "fc_3",
        front: "What is the primary role of molecular oxygen in aerobic respiration?",
        back: "Oxygen acts as the terminal electron acceptor in the electron transport chain, forming water.",
        hint: "Without it, electron carriers back up and oxidative phosphorylation halts.",
        concept: "Oxidative Phosphorylation",
        difficulty: "medium",
      },
      {
        id: "fc_4",
        front: "What enzyme synthesizes ATP using the electrochemical proton gradient?",
        back: "ATP Synthase, a rotary motor enzyme powered by proton-motive force.",
        hint: "Think of an ion-driven turbine on the inner cristae membrane.",
        concept: "Chemiosmosis",
        difficulty: "easy",
      },
      {
        id: "fc_5",
        front: "What 4-carbon molecule condenses with Acetyl-CoA to begin the Krebs Cycle?",
        back: "Oxaloacetate (which combines with 2C Acetyl-CoA to produce 6C Citrate).",
        hint: "It must be regenerated at the end of every cycle turn.",
        concept: "Krebs Cycle",
        difficulty: "hard",
      },
    ],
    quiz: [
      {
        id: "qz_1",
        question: "Which stage of cellular respiration produces the greatest amount of ATP?",
        options: ["Glycolysis", "Pyruvate Oxidation", "The Krebs Cycle", "Oxidative Phosphorylation"],
        correctIndex: 3,
        explanation:
          "Oxidative phosphorylation accounts for approximately 26-28 of the 30-32 total ATP molecules generated per glucose molecule.",
        concept: "Bioenergetics",
      },
      {
        id: "qz_2",
        question: "Under anaerobic conditions (absence of oxygen), which process can still proceed normally?",
        options: ["Glycolysis", "Electron Transport Chain", "Krebs Cycle", "Pyruvate Dehydrogenase Reaction"],
        correctIndex: 0,
        explanation:
          "Glycolysis takes place in the cytoplasm and requires no oxygen, allowing organisms to generate ATP via fermentation when O2 is absent.",
        concept: "Glycolysis",
      },
      {
        id: "qz_3",
        question: "Protons (H+) are pumped from the mitochondrial matrix into which compartment to build the proton gradient?",
        options: ["Outer cytoplasm", "Intermembrane space", "Inner membrane cristae lumen", "Nuclear envelope"],
        correctIndex: 1,
        explanation:
          "Complexes I, III, and IV pump protons into the intermembrane space, creating a high concentration gradient relative to the matrix.",
        concept: "Chemiosmosis",
      },
      {
        id: "qz_4",
        question: "How many total CO2 molecules are released from the complete catabolism of one 6-carbon glucose molecule?",
        options: ["2 CO2", "4 CO2", "6 CO2", "12 CO2"],
        correctIndex: 2,
        explanation:
          "All 6 carbons of glucose are converted to CO2: 2 during pyruvate oxidation and 4 during two turns of the citric acid cycle.",
        concept: "Krebs Cycle",
      },
    ],
    studyChecklist: [
      {
        id: "t_1",
        task: "Review the net reactants and products of Glycolysis vs Krebs Cycle",
        estimatedMinutes: 15,
        completed: false,
      },
      {
        id: "t_2",
        task: "Draw the mitochondrial membrane and label ETC complexes I-IV and ATP Synthase",
        estimatedMinutes: 20,
        completed: false,
      },
      {
        id: "t_3",
        task: "Test yourself with all flashcards until 100% mastery",
        estimatedMinutes: 10,
        completed: false,
      },
      {
        id: "t_4",
        task: "Complete the quiz and review incorrect questions",
        estimatedMinutes: 10,
        completed: false,
      },
    ],
    masteryMetrics: [
      { category: "Glycolysis", totalCount: 2, confidenceScore: 85 },
      { category: "Krebs Cycle", totalCount: 2, confidenceScore: 70 },
      { category: "Oxidative Phosphorylation", totalCount: 3, confidenceScore: 60 },
      { category: "Chemiosmosis", totalCount: 2, confidenceScore: 75 },
    ],
  },
};

/**
 * Creates dynamic mock study data from user input if not matching pre-canned sets.
 */
export function generateDynamicMockSet(userInput: string): StudySet {
  const cleaned = userInput.trim();
  const firstSentence = cleaned.split(/[.\n]/)[0] || "Custom Topic";
  const title = firstSentence.length > 50 ? firstSentence.slice(0, 47) + "..." : firstSentence;

  // Extract key sentences
  const sentences = cleaned
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keyConcepts = sentences.slice(0, 4).map((s, idx) => {
    const words = s.split(" ");
    const term = words.slice(0, Math.min(3, words.length)).join(" ");
    return {
      term: term.charAt(0).toUpperCase() + term.slice(1),
      definition: s,
      category: idx % 2 === 0 ? "Core Principle" : "Application",
    };
  });

  const flashcards = (sentences.length >= 3 ? sentences.slice(0, 5) : [cleaned]).map((s, idx) => ({
    id: `mock_fc_${idx}_${Date.now()}`,
    front: `What is the core takeaway regarding: "${s.slice(0, 35)}..."?`,
    back: s,
    hint: "Think about the primary definition and its context in the text.",
    concept: "Key Concept",
    difficulty: (idx % 3 === 0 ? "easy" : idx % 3 === 1 ? "medium" : "hard") as "easy" | "medium" | "hard",
  }));

  const quiz = [
    {
      id: `mock_qz_1_${Date.now()}`,
      question: `According to the notes, what is true regarding ${keyConcepts[0]?.term || "the subject"}?`,
      options: [
        keyConcepts[0]?.definition || "It represents the foundational concept discussed.",
        "It was disproven in early experimental trials.",
        "It only applies under extreme temperature and pressure.",
        "It acts strictly as an unreactive catalyst.",
      ],
      correctIndex: 0,
      explanation: "This directly aligns with the definitions provided in your study notes.",
      concept: "Core Concept",
    },
    {
      id: `mock_qz_2_${Date.now()}`,
      question: `Which of the following is a key component emphasized in the text?`,
      options: [
        "External non-standard factors not mentioned in the text",
        keyConcepts[1]?.term || "The primary mechanism identified in the text",
        "An obsolete hypothesis superseded by modern doctrine",
        "A purely theoretical model with no practical evidence",
      ],
      correctIndex: 1,
      explanation: "This concept is explicitly highlighted as a critical pillar in the notes.",
      concept: "Mechanism",
    },
    {
      id: `mock_qz_3_${Date.now()}`,
      question: "How should an analyst or student best synthesize this material?",
      options: [
        "Memorize isolated terms without examining relationships",
        "Ignore foundational definitions and focus only on exceptions",
        "Connect the underlying principles to concrete examples and test recall",
        "Rely solely on intuitive guesswork",
      ],
      correctIndex: 2,
      explanation: "Active recall and concept synthesis are the most effective study strategies.",
      concept: "Synthesis",
    },
  ];

  return {
    id: `set_${Date.now()}`,
    title: title || "Custom Study Set",
    topic: "Applied Notes Analysis",
    summary: `Structured study material generated from your input (${cleaned.length} characters). Includes flashcards, active recall questions, and a targeted study plan.`,
    sourceNotes: cleaned,
    createdAt: new Date().toISOString(),
    keyConcepts: keyConcepts.length > 0 ? keyConcepts : [
      { term: "Central Theme", definition: cleaned.slice(0, 100), category: "Foundation" }
    ],
    flashcards: flashcards.length > 0 ? flashcards : [
      {
        id: `mock_fc_fallback`,
        front: "What is the primary topic of these notes?",
        back: cleaned.slice(0, 120),
        hint: "Review the introductory sentences.",
        concept: "General",
        difficulty: "easy",
      }
    ],
    quiz,
    studyChecklist: [
      { id: "task_1", task: "Flip through all flashcards and mark unknown items", estimatedMinutes: 10, completed: false },
      { id: "task_2", task: "Take the quiz and review detailed explanations", estimatedMinutes: 10, completed: false },
      { id: "task_3", task: "Re-test only incorrect questions to solidify weak areas", estimatedMinutes: 5, completed: false },
    ],
    masteryMetrics: [
      { category: "Foundational Concepts", totalCount: 3, confidenceScore: 70 },
      { category: "Applied Recall", totalCount: 2, confidenceScore: 65 },
    ],
  };
}

