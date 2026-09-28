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
An agent notices that checkout latency has doubled. It proposes a rollback. Between that observation and a safe, useful outcome sit several engineering questions: which data did it read, which revision is affected, what can it change, and how will it know whether the change helped?

The model participates in this system. Its surroundings determine whether an investigation can become completed work.

## Give the task an observable outcome

“Investigate the deployment” leaves success ambiguous. A clearer task asks the agent to compare the new revision with a control, identify supported regressions, and produce a recommendation with evidence.

Specify the observation window, relevant services, and permitted actions. The agent can then choose its investigative path while the system retains a concrete definition of completion.

## Put repeated mechanics in code

Authentication, pagination, retries, and unit conversion should not become fresh reasoning problems on every turn. Collect data through ordinary code and expose a stable interface for exploration.

The same applies to execution. A tool result should distinguish success, failure, and an unknown outcome. If an action times out, check whether it happened before retrying it. Otherwise a network interruption can become a duplicate operation.

## Preserve progress across turns

A long investigation needs more than a transcript. Keep references to evidence, current hypotheses, completed actions, and open questions in explicit state.

After a restart, the agent should know that it already inspected database latency and still needs to check connection acquisition. That continuity reduces repeated work and makes handoffs inspectable.

## Close the loop with feedback

Record what happened after the recommendation. Did the rollback reduce errors? Was the apparent regression a change in traffic mix? The answer helps separate a plausible explanation from an effective decision.

Evaluate the model together with its data interfaces, execution loop, and state handling. Changing any one of them can change the result. That is the unit of engineering: an agent operating inside a complete system.
`
  },
  {
    slug: "judgment-under-uncertainty",
    aliases: ["rollouts-are-decision-problems"],
    title: "Judgment Under Uncertainty",
    eyebrow: "Reasoning & judgment",
    readTime: "2 min",
    description:
      "A rollout decision depends on evidence, the cost of waiting, and the reversibility of the next step.",
    featured: false,
    body: `
A canary release shows a 30% increase in p95 latency. Traffic is also shifting toward a more expensive endpoint. Should the agent stop the rollout?

The aggregate graph establishes a change. It does not yet establish its cause. A useful decision connects the evidence to the consequences of acting or waiting.

## Ask what would change the decision

Compare latency within the same endpoint and traffic class. If both revisions slow down equally, the deployment becomes a weaker explanation. If the new revision alone degrades, the case for intervention strengthens.

This is the value of a discriminating check: its possible results lead to different next steps. Collecting another graph that repeats the same aggregate adds less information.

## Match the action to the uncertainty

Holding the rollout at 5% exposure may buy time to investigate. Expanding to every region increases the consequences of being wrong. Rolling back can be appropriate when harm is growing, even before the root cause is fully established.

The relevant questions are concrete: how much traffic is affected, how quickly is the condition worsening, and which actions are reversible? A fixed confidence threshold cannot express all of that.

## Keep the reason for the decision

An assessment should preserve what was observed, the leading explanation, the unresolved alternative, and the next check. “Hold expansion because latency is worse within comparable traffic; verify dependency timing” is more useful than an unexplained “unsafe.”

When new evidence arrives, the agent can revise a specific claim. Reviewers can also distinguish a reasonable decision under uncertainty from a correct answer reached for the wrong reason.

The outcome closes the loop. If a rollback restores latency, it strengthens some explanations; it does not automatically prove every part of the original diagnosis. Good judgment remains open to that distinction.
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
An incident agent identifies a connection leak. Another identifies it ten minutes earlier, before customers see errors. A third recommends restarting every service and happens to clear the symptom.

All three might receive credit from a grader that checks only the final diagnosis. They did not perform equally well.

Define quality across the dimensions that matter: supported diagnosis, time to detection, unnecessary interventions, and the cost of investigation. Include healthy scenarios to measure false alarms.

Also distinguish a recommendation from its outcome. “I rolled back the release” is a claim in a transcript. The deployed revision and resulting service health are observations in the environment.

A useful evaluation makes those expectations explicit before the agent runs. Otherwise, “good” quietly becomes whatever the easiest grader can count.
`
  },
  {
    slug: "skills-arent-policies",
    title: "Skills aren’t policies",
    readTime: "1 min",
    description: "Knowing how to act and having the authority to act are different things.",
    body: `
A deployment skill can explain how to compare revisions, drain traffic, and roll back a service. Knowing that procedure does not grant permission to execute it in production.

Skills package useful methods. Policy determines which resources and actions are available under the current conditions. The runtime must enforce that policy when a tool runs.

Consider a skill that says “roll back if the error rate rises.” The agent may use it to form a recommendation. Whether it can change the deployment still depends on its granted scope, the environment, and any required approval.

This separation lets teams improve investigative methods without silently expanding authority. A downloaded playbook can teach the agent a better technique; it cannot give itself production access.
`
  },
  {
    slug: "memory-should-accumulate-judgment",
    title: "Memory should accumulate judgment",
    readTime: "1 min",
    description: "Experience becomes useful when it improves the next decision.",
    body: `
“Restarting checkout fixed the incident” is a dangerous memory to reuse on its own.

A more useful record says that revision B leaked connections during an hourly job, restarting temporarily cleared the pool, and a later patch removed the leak. It links the measurements and records which service version the lesson applies to.

That record separates symptom relief from root-cause correction. It also tells the next agent what to check before applying the lesson again.

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
An agent claims that a deployment caused a latency spike. A verifier reads its summary, finds the explanation coherent, and approves it. Neither checks whether the control revision also slowed down.

The second opinion inherited the first investigation’s missing evidence. Agreement added little assurance.

Give the verifier access to the underlying measurements and a specific claim to challenge. It can compare equivalent traffic, inspect the deployment timestamp, or check whether the cited query actually returns the reported result.

Use direct checks where the claim permits them. A file exists, a test passes, or a deployed revision matches the requested version. Reserve judgment for questions those checks cannot settle.

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
