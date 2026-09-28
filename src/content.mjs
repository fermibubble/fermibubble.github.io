import { autonomyOverview } from "./principle-series.mjs";
import { systemsWriting } from "./systems-writing.mjs";
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

export const notes = [
  {
    slug: "what-does-good-mean-for-an-agent",
    title: "What does “good” mean for an agent?",
    readTime: "1 min",
    description: "Define success through outcomes, constraints, and the cost of getting there.",
    body: `
A research agent finds ten papers. Another finds three that directly answer the question. A third produces a persuasive synthesis whose citations do not support its central claim.

A grader that counts sources might prefer the first. A grader that rewards fluent prose might prefer the third. Neither has established which answer is useful.

Define quality across the dimensions that matter: relevance, coverage of competing explanations, support for material claims, and the cost of investigation. Include questions for which the available sources cannot settle the answer.

Also distinguish the agent’s report from the delivered outcome. “Every citation was verified” is a claim in a transcript. Opening the sources and checking what they establish is a separate evaluation.

A useful evaluation makes those expectations explicit before the agent runs. Otherwise, “good” quietly becomes whatever the easiest grader can count.
`
  },
  {
    slug: "skills-arent-policies",
    title: "Skills aren’t policies",
    readTime: "1 min",
    description: "Knowing how to act and having the authority to act are different things.",
    body: `
A calendar skill can explain how to find a free slot, draft an invitation, and reschedule a meeting. Knowing that procedure does not grant permission to change someone’s calendar.

Skills package useful methods. Policy determines which resources and actions are available under the current conditions. The runtime must enforce that policy when a tool runs.

Consider a skill that says “move conflicting meetings to the next available slot.” The agent can propose a schedule. Sending invitations or moving an existing meeting still depends on its granted scope and any required approval.

This separation lets teams improve investigative methods without silently expanding authority. A downloaded playbook can teach the agent a better technique; it cannot grant access to a private calendar.
`
  },
  {
    slug: "memory-should-accumulate-judgment",
    title: "Memory should accumulate judgment",
    readTime: "1 min",
    description: "Experience becomes useful when it improves the next decision.",
    body: `
“This parser works for supplier invoices” is a poor memory to reuse on its own.

A more useful record says that the parser handled the supplier’s English PDFs, failed on scanned pages, and required a different decimal separator for its German template. It links representative documents and records which parser version was tested.

That record separates demonstrated coverage from an appealing generalization. It also tells the next agent what to check before applying the lesson again.

Useful memory needs a situation, a decision, an observed outcome, and limits on reuse. Retain evidence references so the lesson can be challenged as systems change.

The goal is to improve the next investigation. A growing archive of confident summaries can do the opposite if each one loses the conditions that made it true.
`
  },
  {
    slug: "context-vs-harness-engineering",
    title: "Context engineering vs. harness engineering",
    readTime: "1 min",
    description: "Context determines what the model can see. The harness determines how work progresses.",
    body: `
Suppose an agent misses the relevant log entry. Better filtering and retrieval address a context problem. Suppose it finds the entry, issues a command, loses the response, and executes the command again. That is an execution problem.

Context engineering determines what information reaches the model, in what form, and at which turn. Harness engineering covers the loop around it: tool execution, permissions, retries, persistent state, and recovery.

The boundary is useful when debugging. A larger prompt will not make a non-idempotent action safe to retry. A more robust runner will not repair a query that consistently selects the wrong evidence.

Design the two together, then inspect them separately. Ask what the model could see and what the surrounding system actually did. Those questions often point to different fixes.
`
  },
  {
    slug: "why-agent-verifiers-fail",
    title: "Why agent verifiers fail",
    readTime: "1 min",
    description: "Agreement is more useful when it comes from independent perspectives.",
    body: `
An agent changes a date parser and declares the bug fixed. A verifier reads the diff, finds the explanation coherent, and approves it. Neither runs a test across a daylight-saving transition.

The second opinion inherited the first investigation’s missing evidence. Agreement added little assurance.

Give the verifier the patch, a runnable environment, and a specific claim to challenge. It can test ambiguous timestamps, change the machine’s timezone, or generate a counterexample outside the author’s happy path.

Use direct checks where the claim permits them. A file exists, a test passes, or the parsed timestamp matches the expected instant. Reserve judgment for questions those checks cannot settle.

A verifier earns its place by adding evidence or finding counterexamples. Rephrasing the same explanation with a second model is a weak substitute.
`
  }
].map(withPublicationDate).sort(newestFirst);

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
