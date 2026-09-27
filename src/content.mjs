import { autonomyOverview, principleEssays } from "./principle-series.mjs";

export const site = {
  name: "Oddly",
  author: "Chaitanya",
  shortName: "O",
  title: "Oddly — Ideas on autonomy & trust",
  description:
    "Ideas on engineering autonomous agents, embedding trustworthiness, and learning from experience.",
  statement: "Systems should earn the authority we give them.",
  intro:
    "I work on engineering autonomous agents and embedding trustworthiness into intelligent systems. I write about how they reason, act, and learn—and what it takes to earn our trust."
};

export const principles = principleEssays.map((item) => ({
  number: String(item.seriesNumber).padStart(2, "0"),
  title: item.title, text: item.summary, slug: item.slug
}));

export const writing = [
  autonomyOverview,
  ...principleEssays,
  {
    slug: "engineering-autonomous-agents",
    aliases: ["agent-harness-is-the-product"],
    title: "Engineering Autonomous Agents",
    eyebrow: "Autonomous agents",
    date: "2026-08-29",
    displayDate: "August 29, 2026",
    readTime: "2 min",
    description:
      "Connecting intelligence, purpose, and action in systems we can depend on.",
    featured: true,
    body: `
Autonomous agents bring together a set of abilities: understanding a goal, making decisions, taking action, and adapting as circumstances change.

Engineering them means thinking about how those abilities work together. A strong answer is useful; carrying an intention through to a meaningful outcome asks more of the system.

## Purpose gives capability direction

An agent needs a useful understanding of what it is trying to achieve. Goals give its reasoning direction, while context helps it recognize what matters.

Good engineering makes this relationship clear. The agent should be able to connect its choices to the purpose of the work, and revise its understanding when new information changes the picture.

## The surrounding system matters

Intelligence operates within an environment. The information available to an agent, the actions it can take, and the feedback it receives all influence its behavior.

The design challenge is to make these parts support one another. Understanding should inform action. Action should produce useful feedback. Feedback should improve understanding.

This perspective keeps attention on the whole system, including how people participate in it.

## Autonomy is a relationship

An agent's independence depends on the responsibilities people are willing to give it. That relationship requires clear expectations, understandable behavior, and room for correction.

The most useful systems can act with initiative while recognizing when a question, a pause, or a human perspective would improve the result.

I see engineering autonomous agents as a continuing effort to connect capability with purpose—and to make that connection dependable enough for people to trust.
`
  },
  {
    slug: "judgment-under-uncertainty",
    aliases: ["rollouts-are-decision-problems"],
    title: "Judgment Under Uncertainty",
    eyebrow: "Reasoning & judgment",
    date: "2026-08-18",
    displayDate: "August 18, 2026",
    readTime: "2 min",
    description:
      "How should an autonomous system act when its understanding is incomplete?",
    featured: true,
    body: `
Intelligent systems rarely have a complete picture. Information can be missing, evidence can conflict, and the consequences of a decision may take time to become clear.

Good judgment starts by recognizing those limits. It asks what the available evidence supports, what remains uncertain, and how much that uncertainty matters.

## Confidence should have a basis

A clear answer is valuable when its certainty is justified. When it is not, the appearance of confidence can hide the most important part of the decision.

An agent should make meaningful uncertainty understandable. People need to know which assumptions carry the conclusion and what new information might change it.

## Action has consequences

The same uncertainty can justify different choices depending on what is at stake. Some decisions are easy to revise. Others create commitments that are difficult to undo.

Sound judgment connects evidence with consequence. It considers whether to act, seek more information, or involve someone with a different perspective.

This is part of what makes autonomy useful: the ability to choose a sensible next step without pretending that every question has already been resolved.

## Learning keeps judgment open

A decision is made with the understanding available at the time. Its outcome gives us a chance to revisit that understanding.

Learning requires curiosity about both success and failure. Which assumptions held? What did we overlook? Would the same reasoning still make sense in a different situation?

An agent that can revise its judgment thoughtfully is better prepared for an unfamiliar world. That capacity for revision is an essential part of trustworthiness.
`
  }
];

export const notes = [
  {
    slug: "what-does-good-mean-for-an-agent",
    title: "What does “good” mean for an agent?",
    date: "2026-09-03",
    displayDate: "Sep 03, 2026",
    readTime: "1 min",
    description: "Quality begins with a shared understanding of what matters.",
    body: `
Calling an agent capable leaves an important question open: capable of doing what, and to whose standard?

A useful system needs a sense of purpose. It should understand the intended outcome, the constraints that matter, and the circumstances in which asking for help is the better choice.

Quality also depends on the way the work is done. A result should be understandable, appropriate to the situation, and open to correction.

Making those expectations clear is part of engineering. It gives intelligence direction and gives people a basis for deciding whether the system deserves their trust.
`
  },
  {
    slug: "skills-arent-policies",
    title: "Skills aren’t policies",
    date: "2026-08-28",
    displayDate: "Aug 28, 2026",
    readTime: "1 min",
    description: "Knowing how to act and having the authority to act are different things.",
    body: `
A skill gives an agent a way to approach a task. A policy defines the responsibilities and boundaries within which it operates.

Both matter. Expertise helps the agent act effectively; boundaries help make that action trustworthy.

Keeping the distinction clear creates room for useful independence. An agent can discover a better approach while remaining accountable to the same expectations.

The broader principle is simple: growing capability should come with a clear understanding of responsibility.
`
  },
  {
    slug: "memory-should-accumulate-judgment",
    title: "Memory should accumulate judgment",
    date: "2026-08-21",
    displayDate: "Aug 21, 2026",
    readTime: "1 min",
    description: "Experience becomes useful when it improves the next decision.",
    body: `
Remembering what happened is a starting point. Learning asks what that experience should change.

Useful memory preserves the relationship between a situation, a decision, and its consequences. It helps an agent recognize when an earlier lesson applies and when the present situation deserves fresh thinking.

That requires care. A familiar example can clarify a question, but it can also encourage an assumption that no longer holds.

I am interested in memory that supports better judgment: retaining useful lessons while keeping them open to challenge.
`
  },
  {
    slug: "context-vs-harness-engineering",
    title: "Context engineering vs. harness engineering",
    date: "2026-08-14",
    displayDate: "Aug 14, 2026",
    readTime: "1 min",
    description: "Understanding the world and acting within it are connected engineering problems.",
    body: `
Context shapes what an agent can understand. It brings relevant information into view and helps the system recognize what matters.

The harness is the surrounding system that lets the agent turn that understanding into action. It connects capabilities, responsibilities, feedback, and continuity.

The two belong together. Rich context needs a dependable way to act on it, and dependable action needs a sound understanding of the situation.

Thinking about both keeps the engineering focus on the relationship between reasoning and consequence.
`
  },
  {
    slug: "why-agent-verifiers-fail",
    title: "Why agent verifiers fail",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026",
    readTime: "1 min",
    description: "Agreement is more useful when it comes from independent perspectives.",
    body: `
Asking another agent to check a result can help. The value of that check depends on what it brings to the question.

Two agents may agree because they share the same assumptions or overlook the same missing information. Agreement alone tells us little about those blind spots.

Stronger assurance comes from combining different ways of examining a result: evidence, independent perspectives, experience, and human judgment where it matters.

The aim is to make a conclusion easier to challenge and more deserving of confidence.
`
  }
];

export const projects = [
  {
    index: "01",
    title: "Engineering Autonomous Agents",
    label: "Intelligence & action",
    status: "Ongoing focus",
    description:
      "Building intelligent systems that can reason, act with purpose, and adapt to a changing world.",
    questions: [
      "What turns intelligence into dependable action?",
      "How can autonomy extend human judgment?"
    ]
  },
  {
    index: "02",
    title: "Embedding Trustworthiness",
    label: "Trust & responsibility",
    status: "Ongoing focus",
    description:
      "Making trustworthiness part of how autonomous systems are designed, how they behave, and how people work with them.",
    questions: [
      "What makes a system worthy of trust?",
      "How should responsibility grow with capability?"
    ]
  },
  {
    index: "03",
    title: "Learning from Experience",
    label: "Memory & adaptation",
    status: "Ongoing focus",
    description:
      "Exploring how experience and feedback can deepen understanding and improve judgment over time.",
    questions: [
      "What is worth remembering?",
      "How can learning improve judgment while keeping it open to challenge?"
    ]
  }
];

export const ideas = [
  "What does it mean for an autonomous system to earn trust?",
  "How can intelligence become better judgment?",
  "What should an agent learn from experience—and what should it reconsider?",
  "How can people and agents develop a shared understanding?",
  "What makes a capable system dependable in an unfamiliar situation?"
];
