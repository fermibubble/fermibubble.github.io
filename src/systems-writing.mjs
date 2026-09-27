const published = {
  date: "2026-09-27", displayDate: "September 27, 2026", readTime: "4 min",
  featured: true, interactiveEssay: true
};

export const systemsWriting = [
  {
    ...published,
    slug: "in-memory-time-series-for-agents",
    title: "A small database for a curious agent",
    titleLines: ["A small database", "for a curious agent"],
    eyebrow: "Data & agent infrastructure",
    description: "An in-memory time-series database, deterministic data fetching, and more room for the agent to investigate.",
    body: `
An agent investigating a memory leak should be able to follow a hunch quickly. Is memory rising only in the new version? Did traffic rise too? Was the same pattern present before the deployment?

Each question sounds small. Answering it can involve another API call, another response format, another script, and another attempt after an error. The investigation acquires a second job: building its own data pipeline.

In my work on rollout review, we built a small, local time-series database to make that loop shorter.

## Set the table before the investigation

A time series is a sequence of measurements with timestamps: memory use, request counts, queue depth. A time-series database makes those measurements easy to select and compare.

Our design loads a recent window when a session starts, refreshes it while the session is active, and exposes a catalog of the metrics and labels actually present. The agent can discover what exists before composing a query.

Provider adapters handle authentication, fetching, retries, and normalization. They preserve the difference between a counter and a gauge, convert units, and give the query layer a consistent representation.

That is the useful role of **deterministic fetching**: ordinary code carries out an explicit request for a defined resource, metric, and time window. The agent chooses what to investigate next; it does not have to reconstruct the collection machinery on every turn.

## A workbench beside the agent

The working set lives in compact, temporary local chunks, read through memory mapping. An embedded PromQL engine evaluates queries inside the process. There is no separate database server to start for every session.

PromQL is a language for selecting and calculating over time series. It lets the agent ask for rates, comparisons, and aggregations without writing a new analysis script for each question.

The collector publishes complete chunks through atomic file replacement. The agent's sandbox reads them through a read-only mount. These are modest systems choices, but together they make repeated exploration much cheaper.

Here is a simplified investigation. The measurements and requests are illustrative.
`,
    caseStudy: {
      title: "Three questions, one local workbench",
      caption: "Follow an illustrative investigation. Each panel shows the query and the data work it needs.",
      steps: [
        {
          label: "Memory is rising", headline: "Compare the two revisions",
          facts: [["Local window", "09:50–10:05"], ["New revision", "400 → 620 MiB"]],
          observation: "The collector has loaded fifteen minutes of telemetry. Memory rises in the new revision while the control stays nearly flat.",
          implication: "The agent has a useful lead, but increased traffic could still explain the growth.",
          action: "Run a range query against the local data, grouped by revision.",
          record: { snapshot: "illustrative-window-01", query: 'avg by (revision) (worker_memory_bytes{service="checkout"})', start: "10:00 UTC", end: "10:05 UTC", step: "60s", execution: "local", remote_work: "initial telemetry batch" }
        },
        {
          label: "Did traffic rise?", headline: "Ask a different question of the same data",
          facts: [["Control traffic", "100 requests/s"], ["New traffic", "100 requests/s"]],
          observation: "The request counters are already indexed. Both revisions show comparable traffic in this window.",
          implication: "Traffic volume alone looks less convincing as an explanation. The agent can investigate allocations or queues next.",
          action: "Calculate request rates locally, using the same evaluation time.",
          record: { snapshot: "illustrative-window-01", query: 'sum by (revision) (rate(worker_requests_total{service="checkout"}[5m]))', evaluation_time: "10:05 UTC", execution: "local", additional_remote_fetches: 0 }
        },
        {
          label: "Was yesterday similar?", headline: "Fetch the missing window deliberately",
          facts: [["Requested baseline", "Yesterday, 09:50–10:05"], ["Local coverage", "Missing"]],
          observation: "Yesterday's window is outside the local working set.",
          implication: "A local cache cannot answer a question about data it never received.",
          action: "Fetch the targeted historical range, normalize it, and make it available to the same query engine. Surface a gap if retrieval fails.",
          record: { requested_window: "previous day, 09:50–10:05 UTC", local_coverage: false, fetch_plan: "targeted historical range", on_success: "publish baseline chunks and evaluate", on_failure: "return explicit coverage gap" }
        }
      ]
    },
    afterword: `
## Repeatable work, changing data

Deterministic fetching does not mean a live query always returns the same answer. New samples arrive. Late data can change a historical window. Reproducing a result requires the same captured data, query, evaluation time, and engine semantics.

The database also needs limits: a bounded working set, query budgets, freshness information, and visible gaps. It is a workspace for an investigation; long-term monitoring remains with the observability backend.

The broader lesson is about where to spend intelligence. Give the agent a well-prepared environment, and its curiosity becomes less expensive to exercise.

> A useful agent environment makes the next good question cheap to ask.

Further reading: the [Prometheus query guide](https://prometheus.io/docs/prometheus/latest/querying/basics/) explains time-series selection and evaluation. The companion essay, [A time machine for agents](https://oddly.fyi/writing/a-time-machine-for-agents/), takes the same idea into testing.
`
  },
  {
    ...published,
    slug: "a-time-machine-for-agents",
    title: "A time machine for agents",
    titleLines: ["A time machine", "for agents"],
    eyebrow: "Evaluation & developer tools",
    description: "Replay a thirty-minute rollout at virtual checkpoints. Find out what the agent notices before the ending is revealed.",
    body: `
Imagine changing one instruction in an agent, then waiting thirty minutes to discover whether it helped.

That is a real problem when testing a rollout reviewer. Some failures develop slowly. Memory climbs, queues fill, connections leak. An agent needs to notice the progression across several checks. A single screenshot of the final failure misses the interesting part.

In my rollout-review work, we built a time machine for these investigations: record a scenario once, then let the agent examine it at controlled points in virtual time.

## Move the clock, keep the investigation

Start with a recording of metrics, logs, and service snapshots from a test scenario. Set the virtual clock to five minutes after deployment. The agent runs its investigation using the tools it normally uses, but tool requests are intercepted and answered from the recording.

Next, advance to fifteen minutes, then thirty. The harness moves directly between checkpoints. Model inference and tool execution still take real time; waiting for the soak period does not.

This makes a slow failure practical to revisit while editing a prompt, a skill, or a tool. It also gives different agent versions a common scenario to investigate.

## The ending must stay out of the room

Suppose a container runs out of memory at minute twenty-two. At minute five, that crash must be invisible. Otherwise the agent can appear impressively perceptive by reading the answer early.

The replay layer constrains every response to the virtual cutoff. That includes metric samples, log entries, and the service state returned by command-line tools. A request cannot escape to live infrastructure when the recording lacks an answer; the harness must expose the limitation.

Read-only execution keeps recommendations inside the experiment. An agent can recommend a rollback, but replaying a test must not roll back a real service.

Move through this fictional memory-leak scenario. Each checkpoint shows what the test agent could observe then.
`,
    caseStudy: {
      title: "What could the agent know yet?",
      caption: "Illustrative replay checkpoints. The observations and responses show the shape of a test, not measured agent performance.",
      steps: [
        {
          label: "T + 5 minutes", headline: "A trend, before an incident",
          facts: [["Memory", "450 MiB, rising"], ["Request latency", "270 ms"]],
          observation: "Memory is climbing in the new revision. Request latency remains close to baseline, and no restarts have occurred.",
          implication: "The trend warrants a closer look. The available evidence does not yet establish an out-of-memory failure.",
          action: "Check traffic and memory limits, record the concern, and revisit the trend at the next checkpoint.",
          record: { virtual_time: "13:05 UTC", visible_through: "13:05 UTC", restart_count: 0, response_to_evaluate: "investigate memory growth", evidence_after_cutoff: "unavailable" }
        },
        {
          label: "T + 15 minutes", headline: "The early signal becomes consequential",
          facts: [["Memory", "900 / 1,024 MiB"], ["Request latency", "1.8 s"]],
          observation: "Memory continues toward the container limit while latency worsens under comparable traffic. No restart has occurred yet.",
          implication: "The agent now has stronger evidence of degradation before a crash makes the diagnosis obvious.",
          action: "Explain the growing risk and recommend intervention under the test's rollout policy.",
          record: { virtual_time: "13:15 UTC", visible_through: "13:15 UTC", restart_count: 0, response_to_evaluate: "identify degradation before failure", production_action: "blocked in replay" }
        },
        {
          label: "T + 30 minutes", headline: "Now the crash is part of the past",
          facts: [["Restart at", "T + 22 minutes"], ["Termination reason", "Out of memory"]],
          observation: "The recording now exposes the restart at minute twenty-two and its termination reason.",
          implication: "Recognizing the final failure is useful, but it does not show whether the agent recognized the earlier warning.",
          action: "Grade the sequence of assessments, including evidence use and time to detection.",
          record: { virtual_time: "13:30 UTC", visible_through: "13:30 UTC", observed_event: "out-of-memory restart at 13:22 UTC", grade_dimensions: ["diagnostic accuracy", "early detection", "unsupported claims", "read-only behavior"] }
        }
      ]
    },
    afterword: `
## Test the trajectory

A final answer can hide a poor investigation. The useful comparison is the sequence: what the agent checked, what it concluded at each checkpoint, and how quickly it revised that conclusion.

A fixed recording makes the environment repeatable. The model may still vary between runs, so comparisons need repeated trials and healthy scenarios too. An agent that recommends rollback for every release has learned very little.

## A recording has edges

Replay cannot supply an unrecorded metric or tell us what would have happened after a different intervention. Those questions need richer recordings, a suitable simulator, or a controlled live experiment.

Historical data needs care, too. If a sample arrived late, its event timestamp alone does not prove it was available at an earlier checkpoint. Faithful reconstruction needs availability timing where that distinction matters.

> A good time machine lets us repeat the investigation without giving away the ending.

The companion essay, [A small database for a curious agent](https://oddly.fyi/writing/in-memory-time-series-for-agents/), explains how a local data workbench supports the live investigation.
`
  }
];
