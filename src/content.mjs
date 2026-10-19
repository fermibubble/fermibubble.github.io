import { readingPaths } from "./reading-paths.mjs";
import { harnessImprovement } from "./harness-improvement.mjs";
import { evalOverview } from "./eval-writing.mjs";
import { qualityOverview } from "./quality-writing.mjs";
import { agentArchitecture } from "./agent-architecture.mjs";
import { progressiveDisclosure } from "./progressive-disclosure.mjs";
import { autonomyOverview } from "./principle-series.mjs";
import { systemsWriting } from "./systems-writing.mjs";
import { agencyOverview } from "./agency-writing.mjs";
import { classifierOverview } from "./classifier-writing.mjs";
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
  harnessImprovement,
  evalOverview,
  progressiveDisclosure,
  agentArchitecture,
  qualityOverview,
  classifierOverview,
  agencyOverview,
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

export const projects = readingPaths.map((route, i) => ({
  index: String(i + 1).padStart(2, '0'), title: route.title,
  label: ['Architecture & execution', 'Evidence & measurement', 'Experiments & learning'][i],
  status: 'Reading route', description: route.outcome,
  questions: [
    ['What belongs in the model, and what belongs in ordinary code?', 'Which boundaries must remain enforceable when the model is wrong?'],
    ['What outcome does the task require?', 'What evidence would distinguish a real improvement from a lucky run?'],
    ['Which failure is worth turning into an experiment?', 'Which conditions must travel with the resulting lesson?']
  ][i],
  reading: {title: 'Follow this route', href: `/start/#${route.id}`}, links: route.links
}));

export const ideaExperiments = [
  'Hold predictions fixed and vary the permitted action. Inspect how false-positive cost changes the acceptance rule.',
  'Run old and new classifier versions over the same frozen overlap sample before attributing a dashboard change to the world.',
  'Compare coverage and error among accepted cases as the deferral threshold moves; record review workload too.',
  'Compare remote retrieval with a frozen local snapshot, including collection and indexing cost in the total.',
  'Replace one repeated reasoning step with deterministic code and test edge cases that the code must reject.',
  'Insert a late-arriving record whose event time predates the checkpoint; verify it remains unavailable in historical replay.',
  'Choose an action that changes the environment and show exactly where a fixed recorded future stops being a valid comparison.',
  'Retrieve a lesson after changing its parser or policy dependency; require a review instead of unconditional reuse.'
];

export const ideas = [
  "Which decisions should a classifier's labels be allowed to influence?",
  "How can we tell a change in the world from a change in the classifier measuring it?",
  "When should a classifier gather more evidence or leave a case unresolved?",
  "Which evidence should already be local when an agent begins an investigation?",
  "Where should deterministic execution end and model-driven exploration begin?",
  "How much of a 24-hour incident can a checkpoint preserve without leaking its outcome?",
  "When does evaluating an intervention require simulation instead of replay?",
  "What should memory retain so the next agent can verify a lesson before reusing it?"
];
