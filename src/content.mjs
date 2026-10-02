import { autonomyOverview } from "./principle-series.mjs";
import { systemsWriting } from "./systems-writing.mjs";
import { knowledgeWriting } from "./knowledge-writing.mjs";
import { newestFirst, withPublicationDate } from "./publication-dates.mjs";

export const site = {
  name: "Oddly",
  author: "Chaitanya",
  shortName: "O",
  title: "Oddly — Engineering autonomous systems",
  description:
    "Technical essays by Chaitanya Meesala on agent infrastructure, local context, observability, and reproducible evaluation.",
  statement: "Engineering the systems that make agents work.",
  intro:
    "I’m Chaitanya. I build autonomous agents and the infrastructure around them: local context, reliable execution, and reproducible evaluation. Oddly connects the architecture, experiments, and engineering decisions behind that work."
};

export const writing = [
  knowledgeWriting,
  ...systemsWriting,
  autonomyOverview,
  {
    slug: "engineering-autonomous-agents",
    aliases: ["agent-harness-is-the-product"],
    title: "Engineering Autonomous Agents",
    eyebrow: "Autonomous agents",
    readTime: "2 min",
    description:
      "An agent’s capabilities depend on its data, execution loop, state, and feedback. Design them as one system.",
    featured: true,
    body: `
A coding agent is asked to replace a deprecated library across a repository. It finds the imports and writes a patch. Completing the job still requires a dependency map, a test environment, permission to change files, and a way to recover if the task stops halfway through.

The model participates in this system. Its surroundings determine whether an investigation can become completed work.

## Give the task an observable outcome

“Modernize this repository” leaves success ambiguous. A clearer task asks the agent to replace a specific dependency, preserve public behavior, and produce a patch with passing tests.

Specify the target version, affected packages, compatibility requirements, and permitted changes. The agent can choose its approach while the system retains a concrete definition of completion.

## Put repeated mechanics in code

Authentication, pagination, retries, and unit conversion should not become fresh reasoning problems on every turn. Collect data through ordinary code and expose a stable interface for exploration.

The same applies to execution. A tool result should distinguish success, failure, and an unknown outcome. If an action times out, check whether it happened before retrying it. Otherwise a network interruption can become a duplicate operation.

## Preserve progress across turns

A long investigation needs more than a transcript. Keep references to evidence, current hypotheses, completed actions, and open questions in explicit state.

After a restart, the agent should know which packages it migrated, which tests failed, and which design question remains open. That continuity reduces repeated work and makes handoffs inspectable.

## Close the loop with feedback

Check the resulting artifact. Does the patch build in a clean environment? Do integration tests exercise the changed behavior? Does the new dependency work on every supported runtime? The answers separate a plausible patch from a completed migration.

Evaluate the model together with its data interfaces, execution loop, and state handling. Changing any one of them can change the result. That is the unit of engineering: an agent operating inside a complete system.
`
  }
].map(withPublicationDate).sort(newestFirst);

export const notes = [];

export const projects = [
  {
    index: "01",
    title: "Agent systems",
    label: "Reasoning & execution",
    status: "Ongoing focus",
    description:
      "Execution loops, durable state, tool contracts, and recovery: the infrastructure that lets an agent complete work across many steps.",
    questions: [
      "What belongs in the model, and what belongs in ordinary code?",
      "What helps an agent keep making progress across a long task?"
    ],
    reading: { title: "Engineering Autonomous Agents", href: "/writing/engineering-autonomous-agents/" }
  },
  {
    index: "02",
    title: "Data & context",
    label: "Local context & observability",
    status: "Ongoing focus",
    description:
      "Deterministic collection and local access to telemetry, logs, and topology. Rich evidence stays available while the model receives focused results.",
    questions: [
      "Which data should already be waiting when an investigation begins?",
      "How can deterministic collection support flexible reasoning?"
    ],
    reading: { title: "Local Context for Autonomous Agents", href: "/writing/local-context-for-autonomous-agents/" }
  },
  {
    index: "03",
    title: "Evaluation & learning",
    label: "Replay & experimental design",
    status: "Ongoing focus",
    description:
      "Recorded scenarios, checkpoint replay, and outcome-based evaluation. Compare decisions across long tasks without reproducing the entire waiting period.",
    questions: [
      "How can we test a slow failure without waiting for it every time?",
      "What distinguishes an improvement from a lucky run?"
    ],
    reading: { title: "Checkpoint Replay for Long-Horizon Agent Evaluation", href: "/writing/checkpoint-replay-for-agent-evaluation/" }
  }
];

export const ideas = [
  "Which evidence should already be local when an agent begins an investigation?",
  "Where should deterministic execution end and model-driven exploration begin?",
  "How much of a 24-hour incident can a checkpoint preserve without leaking its outcome?",
  "When does evaluating an intervention require simulation instead of replay?",
  "What should memory retain so the next agent can verify a lesson before reusing it?"
];
