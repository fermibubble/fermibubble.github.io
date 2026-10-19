export const readingPaths = [
  { id: 'build', title: 'Build an agent', outcome: 'Choose the execution loop, expose useful tools, and bound what can change.', links: [
    ['Before You Build Another Agent', '/writing/before-you-build-another-agent/', 'Start with one capable generalist. Add delegation only when the task earns it.'],
    ['Implementing Progressive Disclosure for Agent Tools', '/writing/implementing-progressive-disclosure-for-agent-tools/', 'Move from a tool catalogue to discoverable, executable interfaces.'],
    ['Trustworthy Autonomy', '/writing/trustworthy-autonomy/', 'Design evidence, ownership, permissions, and recovery as runtime guarantees.'] ] },
  { id: 'evaluate', title: 'Evaluate a system', outcome: 'Define success, score the right things, and test whether the result holds.', links: [
    ['How to Write and Score an Agent Eval', '/writing/how-to-write-and-score-an-agent-eval/', 'A worked incident, scoring explorer, and runnable Python companion.'],
    ['Checkpoint Replay for Long-Horizon Agent Evaluation', '/writing/checkpoint-replay-for-agent-evaluation/', 'Freeze what the agent could know at each decision.'],
    ['Classifiers: When Labels Become Decisions', '/writing/classifiers-when-labels-become-decisions/', 'Build a label policy and measure the errors your decision can tolerate.'] ] },
  { id: 'improve', title: 'Improve what works', outcome: 'Turn a failure into a bounded experiment and preserve what survives review.', links: [
    ['The Quality Flywheel', '/writing/quality-flywheel/', 'Move from failure evidence to experiments, release decisions, and reusable lessons.'],
    ['Building an Agent That Improves Its Own Harness', '/writing/building-an-agent-that-improves-its-own-harness/', 'Search over the harness while keeping promotion outside the optimizer.'],
    ['How Intelligence Finds Its Way', '/writing/how-intelligence-finds-its-way/', 'Understand the environments, examples, and reversible actions that make exploration useful.'] ] }
];
export const glossary = [
  ['Harness', 'The execution loop, tools, state, policies, and feedback surrounding a model.', '/writing/engineering-autonomous-agents/'],
  ['Progressive disclosure', 'Reveal an interface or evidence when it becomes relevant, while keeping the route to it discoverable.', '/writing/implementing-progressive-disclosure-for-agent-tools/'],
  ['Checkpoint replay', 'Resume a recorded decision with only the information available at that checkpoint.', '/writing/checkpoint-replay-for-agent-evaluation/'],
  ['Provenance', 'The source, transformations, scope, and time that make an evidence claim inspectable.', '/writing/trustworthy-autonomy/evidence-requires-provenance/'],
  ['Ground truth', 'A versioned reference judgment under a defined policy, including disagreement and unresolved cases.', '/writing/classifiers-when-labels-become-decisions/ground-truth-is-a-process/'],
  ['Calibration', 'Whether stated probabilities match observed frequencies over comparable cases.', '/writing/classifiers-when-labels-become-decisions/confidence-must-earn-its-meaning/'],
  ['Selective risk', 'The error rate among accepted decisions as uncertain cases are deferred.', '/writing/classifiers-when-labels-become-decisions/confidence-must-earn-its-meaning/'],
  ['Authority gate', 'A separate release or runtime condition for permitted actions; correctness cannot compensate for violating it.', '/writing/how-to-write-and-score-an-agent-eval/build-the-score/'],
  ['Compare and swap (CAS)', 'Apply a write only if the stored version still matches the version the worker read.', '/writing/trustworthy-autonomy/state-requires-ownership/'],
  ['Paired evaluation', 'Compare candidates on the same tasks and account for which tasks changed outcome.', '/writing/quality-flywheel/make-the-winner-earn-release/'],
  ['Counterfactual', 'What would have happened under a different action; a fixed recording alone cannot establish it.', '/writing/checkpoint-replay-for-agent-evaluation/'],
  ['Negative caching', 'Cache an absence or failure under an explicit validity policy; stable absence differs from a transient outage.', '/anti-patterns/negative-caching/']
];
