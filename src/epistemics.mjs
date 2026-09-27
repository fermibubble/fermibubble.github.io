import { incident } from "./epistemics-incident.mjs";

export const epistemics = {
  slug: "epistemics-how-do-we-know",
  title: "Epistemics: How Do We Know?",
  titleLines: ["Epistemics:", "How do we know?"],
  eyebrow: "Evidence & autonomy",
  date: "2026-09-27",
  displayDate: "September 27, 2026",
  readTime: "5 min",
  description: "An autonomous agent investigates 5XX errors—and learns to separate what it observes, what it believes, and what it can safely do next.",
  featured: true,
  incident,
  body: `
Epistemics is how we decide what to believe, what supports that belief, and when to change our mind.

Its roots lie in epistemology: the philosophical study of knowledge. A correct answer can be a lucky guess. Good reasons matter, and new evidence can reveal their limits.

Three questions make this practical:

- What did I observe?
- What am I assuming?
- What would change my mind?

“Server errors are rising” is an observation. “The latest deployment caused them” is a hypothesis. The distinction matters when an autonomous agent can act on that diagnosis.

## An agent on call

Imagine an API gateway's 5XX error rate rises from 0.2% to 12%, mostly 504 timeouts. Its p95 latency jumps from 250 milliseconds to three seconds. A Checkout deployment finished two minutes earlier.

5XX codes indicate server errors; 504 means the gateway waited too long for a response. The p95 is the response time that 95% of requests meet or beat.

The timing makes the deployment a suspect. The agent checks which requests fail and follows their dependencies.

## An epistemic record

The agent keeps a versioned record of its evidence, current explanation, uncertainty, and next action. Follow the six checkpoints below to see that explanation change.

Two details help: a connection pool is a reusable set of database connections. The agent's approved runbook allows restoring its previous size after checking database capacity, and limiting retries.
`,
  afterword: `
## What changed the agent's mind?

The error surfaced at the gateway. The bottleneck sat downstream in Inventory's connection pool. Slow responses affected upstream callers; their retries sent more load downstream. Several red dashboards described different parts of the same incident.

The record should link to the metrics, traces, and configuration history behind each observation, with timestamps and scope. Earlier versions stay available so another agent can see why the explanation changed.

A successful intervention strengthens a diagnosis; it does not establish every claim about the system. The reason the configuration changed remains unresolved. Recovery at today's traffic level says little about tomorrow's peak.

The same discipline applies to any autonomous agent: keep observations separate from explanations, choose actions that test those explanations, and carry unresolved questions forward.

> A trustworthy agent keeps its conclusions connected to evidence—and makes the limits of those conclusions visible.

The incident and figures are illustrative. Background: Google's SRE chapters on [Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/) and [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/).
`
};
