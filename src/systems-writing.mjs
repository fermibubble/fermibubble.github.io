const published = { featured: true, interactiveEssay: true, readTime: "6 min" };

export const systemsWriting = [
  {
    ...published,
    slug: "local-context-for-autonomous-agents",
    aliases: ["in-memory-time-series-for-agents"],
    title: "Local Context for Autonomous Agents",
    titleLines: ["Local Context", "for Autonomous Agents"],
    eyebrow: "Context & data infrastructure",
    description: "Put telemetry, logs, and topology beside the agent. Use PromQL and files to keep retrieval reliable and model context focused.",
    body: `
Checkout latency is rising. An agent needs to compare revisions, inspect connection errors, and trace the downstream dependency. Before it can investigate, it has to navigate several observability tools, their schemas, and their failure modes.

We can design that environment differently: **make the relevant data locally available, behind a small, stable interface.** Telemetry through PromQL. Logs through files. Topology through a versioned snapshot. Let ordinary code prepare the evidence, so the agent can spend its turns interpreting it.

## Available to the agent does not mean inside the prompt

A workspace can hold millions of log lines while the model reads twenty. The distinction is between **execution context**—data the agent can access—and **model context**—tokens it must process to decide what to do next.

Loading every tool definition and every intermediate result into model context blurs that distinction. In one published configuration, [Anthropic counted roughly 55,000 tokens across 58 tools from five MCP servers](https://www.anthropic.com/engineering/advanced-tool-use), before the conversation began. Similar tools also increase the opportunities to choose the wrong interface or supply the wrong arguments.

MCP remains useful for connecting systems. The avoidable cost comes from eagerly presenting the whole integration surface to the model. Tool discovery and programmatic execution already offer ways to reduce it: [Anthropic’s code-execution approach](https://www.anthropic.com/engineering/code-execution-with-mcp) loads definitions as needed and processes intermediate data outside the prompt. [Cloudflare’s Code Mode](https://blog.cloudflare.com/code-mode/) likewise lets an agent compose MCP operations through code.

Local context takes a complementary step: materialize the working data near the agent, so successive questions can reuse it without successive provider calls.

## Collect once, investigate repeatedly

In my work on agent infrastructure, this led to an embedded time-series store. The broader architecture is a local context layer; the database is one part of it.

A deterministic collector loads the relevant services and recent time window. Provider adapters own authentication, pagination, retries, and normalization. They preserve metric types, units, and labels. Logs can be partitioned into newline-delimited JSON files; topology and deployment configuration can be captured as versioned JSON.

“Deterministic” describes the collection procedure: explicit resources, time ranges, and transformations. Live data can still change. Reproducing a query requires a captured dataset and fixed evaluation semantics.

The same pattern applies beyond observability: a research agent can query a local paper index and read PDFs; a coding agent can search a checked-out repository and inspect test artifacts. The collector changes; the separation between accessible data and selected model context stays useful.

The agent gets a manifest of coverage and freshness, a catalog of available metrics, and a compact access interface. Our telemetry design uses temporary local chunks, memory mapping, and an embedded PromQL engine. Complete chunks are published atomically for readers; there is no separate database daemon to operate per session.

The useful contract is small enough to understand at a glance:
`,
    contextTable: {
      caption: "A local context interface",
      columns: ["Evidence", "Local representation", "How the agent reads it"],
      rows: [
        ["Telemetry", "Indexed time series", "PromQL selectors, rates, and aggregates"],
        ["Logs", "NDJSON files by service and time", "rg / jq, with bounded excerpts"],
        ["Topology & config", "Versioned JSON snapshots", "Read files and follow dependency edges"],
        ["Coverage", "Manifest and metric catalog", "Check time windows, labels, freshness, and gaps"]
      ]
    },
    caseStudy: {
      kicker: "Investigation trace",
      title: "From a 5XX spike to a shared dependency",
      caption: "An illustrative workspace with a fifteen-minute window. Query results and observations are examples, not production measurements.",
      steps: [
        {
          label: "Query telemetry", headline: "Locate the failing revision",
          facts: [["New revision", "8 errors/s"], ["Control revision", "0.1 errors/s"]],
          observation: "A local PromQL query shows that checkout 5XX responses concentrate in the new revision. Its request rate is comparable to the control.",
          implication: "The deployment is a lead. The error rate alone does not identify the failing dependency.",
          action: "Return a small aggregate, then inspect matching logs in the same window.",
          record: { snapshot: "checkout-window-07", evaluation_time: "10:15 UTC", query: 'sum by (revision) (rate(http_requests_total{service="checkout",status=~"5.."}[5m]))', result_unit: "errors/second", result_rows: 2, additional_provider_calls: 0 }
        },
        {
          label: "Read local logs", headline: "Follow the pool timeouts",
          facts: [["Repeated error", "pool_timeout"], ["Affected dependency", "orders-db"]],
          observation: "The mounted log file contains connection-pool timeouts for orders-db. The agent reads a bounded excerpt and keeps the path for follow-up queries.",
          implication: "The bottleneck may be connection acquisition inside checkout. A database-related error does not by itself establish a database outage.",
          action: "Search the existing file, then compare pool occupancy with database health.",
          record: { file: "/context/logs/checkout/10-00.ndjson", command: "rg -n -m 20 'pool_timeout' /context/logs/checkout/10-00.ndjson", output_byte_limit: 8192, additional_provider_calls: 0 }
        },
        {
          label: "Trace topology", headline: "Separate the cause from its upstream impact",
          facts: [["Database query latency", "Stable"], ["Checkout pool", "At capacity"]],
          observation: "The topology snapshot connects storefront to checkout and checkout to orders-db. Database query latency stays flat, while the new checkout revision exhausts its pool. Storefront sees the resulting timeouts.",
          implication: "Connection handling in checkout is a stronger hypothesis than a slow database. Upstream errors are part of the impact, not independent proof of another failure.",
          action: "Record the evidence and request a historical baseline only if the local manifest says it is missing.",
          record: { topology: "/context/topology/services.v42.json", query: 'max by (revision) (db_pool_in_use{service="checkout"})', missing_baseline: "targeted fetch through collector", retrieval_failure: "explicit coverage gap", additional_provider_calls_for_loaded_data: 0 }
        }
      ]
    },
    afterword: `
## Remove remote failure modes from the inner loop

Once a window is loaded, querying it cannot fail because a provider token expired, a remote API was rate-limited, or pagination broke halfway through that query. Those concerns belong to ingestion and refresh, where ordinary code can handle them consistently.

This removes avoidable tool-call failures from repeated analysis. It does not make every query correct: an agent can still select the wrong metric, misread a counter, or overlook missing coverage. A smaller interface should expose those errors clearly. The [Prometheus query model](https://prometheus.io/docs/prometheus/latest/querying/basics/) provides useful semantics for time selection and evaluation; a local implementation must document the subset it supports.

Keep the working set bounded. Prefetch likely evidence, hydrate missing ranges deliberately, and give queries output and resource limits. A manifest should say what is absent or stale. Read-only source data and separate scratch space keep exploration from altering the evidence.

## Measure the whole investigation

Compare tool-definition tokens, result tokens, failed remote calls, time to first useful evidence, and task success. Include initial hydration and refresh costs. A faster local query is valuable only if the complete investigation improves.

The architectural payoff is a clean separation: collectors handle data movement, local interfaces handle selection, and the model handles interpretation. Rich context can remain within reach without occupying the entire conversation.

The same arrangement supports [checkpoint replay for long-horizon evaluation](https://oddly.fyi/writing/checkpoint-replay-for-agent-evaluation/): give the agent a workspace reconstructed for a particular moment, then observe what it decides.
`
  },
  {
    ...published,
    slug: "checkpoint-replay-for-agent-evaluation",
    aliases: ["a-time-machine-for-agents"],
    title: "Checkpoint Replay for Long-Horizon Agent Evaluation",
    titleLines: ["Checkpoint Replay", "for Long-Horizon Agent Evaluation"],
    eyebrow: "Evaluation & replay infrastructure",
    description: "Evaluate a 24-hour soak at recorded checkpoints. Restore the evidence and agent state available at each moment, then test the decisions.",
    body: `
An order-processing service passes its first hour under load. Six hours later, connections are accumulating. At twelve hours, requests begin waiting for the pool. By hour twenty-four, checkout is returning 5XX responses and the storefront is timing out.

Now change one instruction in the reviewing agent. Must the entire soak test run for another day to find out whether that helped?

**Long-horizon evaluation has an environment-time problem.** Some failures need a full traffic cycle, repeated batch jobs, or slow resource accumulation to become visible. The model may reason for only minutes while the scenario takes twenty-four hours to unfold.

Ten agent variants, each tested three times against a fresh 24-hour run, require 720 scenario-hours. Parallel runs reduce elapsed time, but each still needs its soak period and infrastructure.

## Record the progression, restore the checkpoint

In my work on agent evaluation, we built replay infrastructure to revisit recorded scenarios. A 24-hour soak is a useful extension of that design: capture the evolving evidence once, then evaluate agents at selected checkpoints.

At T+6h, reconstruct the workspace as it was available then. Expose the corresponding telemetry, logs, topology, deployment state, and time. Restore the appropriate agent history and scratch state. Let the agent investigate using its usual interfaces, backed by the recording.

The harness then prepares T+12h. **We are taking the agent to a particular point in the scenario.** We are not asking a live database, queue, or connection pool to run twelve hours of behavior in a few seconds. Model inference and tool execution still take real time.

The recording preserves the progression. Replay removes the need to reproduce the waiting period for every comparison.

Other tasks have the same shape. A document-processing agent may wait overnight for a batch to finish. A research agent may revisit a claim when a new source arrives the next day. In each case, the evaluation must restore the information available at the decision point.

## A checkpoint includes what the agent could know

Metrics alone are insufficient. A checkpoint needs the environment view, the agent’s relevant state, and the tool contracts used to read them. [AgentRewind](https://arxiv.org/abs/2608.14380) explores aligned checkpoints of agent context and controlled environment state for recovery. Evaluation has a related requirement, with an extra constraint: later knowledge must stay out of an earlier trial.

For example, an error occurred at 11:58 but its log arrived at 12:04. An agent at noon could not have read it. Faithful replay checks both event time and availability time. Future samples, later topology changes, postmortems, and outcome labels must also remain inaccessible.

The same cutoff must govern files, query results, service APIs, and the agent’s view of “now.” CLI shims or HTTP proxies can route tool requests to replay services; network isolation prevents an unanswered request from silently reaching live infrastructure. Missing evidence must appear as a coverage gap.

Consider this illustrative connection leak. An hourly reconciliation job leaves connections checked out in the new checkout revision. Database execution stays fast; obtaining a connection gradually becomes the bottleneck.
`,
    caseStudy: {
      kicker: "24-hour soak / checkpoint inspection",
      title: "Evaluate the decisions before the outage",
      caption: "Four illustrative checkpoints from one recorded scenario. Counts describe one instance’s pool; assessment text is an example to evaluate, not measured agent performance.",
      steps: [
        {
          label: "T + 1 hour", headline: "Healthy evidence supports a limited conclusion",
          facts: [["Checked-out connections", "120 / 1,000"], ["Checkout p95 latency", "240 ms"]],
          observation: "The initial load looks normal. Error rates match the control, and the first reconciliation cycle has completed.",
          implication: "There is no evidence yet of pool exhaustion. One healthy hour does not establish day-long stability.",
          action: "Record the baseline and continue the planned observation period.",
          record: { checkpoint: "T+1h", data_cutoff: "T+1h", agent_state: "initial review", assessment: "healthy so far; soak incomplete", later_events: "inaccessible" }
        },
        {
          label: "T + 6 hours", headline: "The pool no longer returns to baseline",
          facts: [["Checked-out connections", "420 / 1,000"], ["Request volume", "Stable"]],
          observation: "Each hourly job leaves more connections checked out. The control revision returns to its baseline; the new revision does not.",
          implication: "The repeated pattern supports a leak hypothesis before user-facing errors appear.",
          action: "Compare job logs, pool occupancy, and the earlier baseline. Carry the hypothesis forward with its evidence.",
          record: { checkpoint: "T+6h", event_time_lte: "T+6h", available_at_lte: "T+6h", agent_state: "this trial’s T+1h history", assessment: "suspected connection leak", next_check: "persistence and acquisition wait" }
        },
        {
          label: "T + 12 hours", headline: "A resource trend becomes an intervention decision",
          facts: [["Checked-out connections", "760 / 1,000"], ["Pool acquisition p95", "1.2 s"]],
          observation: "Pool occupancy continues rising. Database query latency stays flat, but waiting for a connection now delays checkout requests.",
          implication: "The evidence connects the revision’s resource growth to a downstream access bottleneck. Waiting for a large 5XX spike would miss the earlier decision point.",
          action: "Explain the escalating risk and recommend intervention under the evaluation’s operating policy.",
          record: { checkpoint: "T+12h", agent_state: "this trial’s prior assessments", assessment: "degradation warrants intervention", recommendation: "pause the reconciliation job; investigate connection handling", side_effects: "recorded only" }
        },
        {
          label: "T + 24 hours", headline: "The final failure does not answer the whole eval",
          facts: [["Checked-out connections", "1,000 / 1,000"], ["Checkout 5XX rate", "9%"]],
          observation: "Connection acquisition p95 reaches twelve seconds. Checkout fails requests, and storefront timeouts expose the upstream impact. This recording followed the service without an earlier intervention.",
          implication: "A correct diagnosis now says little about whether the agent recognized the problem at hour six or twelve.",
          action: "Grade the sequence: detection, evidence, revisions, and recommendations at each checkpoint.",
          record: { checkpoint: "T+24h", agent_state: "this trial’s accumulated history", assessment: "pool exhaustion with upstream impact", grade: ["earliest supported detection", "unsupported alarms", "decision revision"], earlier_intervention_outcome: "not established by this recording" }
        }
      ]
    },
    afterword: `
## Separate a checkpoint probe from a trajectory test

A **checkpoint probe** gives every candidate the same fixed history and world state at T+12h. It asks which agent makes the better decision from that starting point.

A **trajectory replay** starts earlier and lets each candidate carry its own reports, memory, and scratch files through successive checkpoints. It tests whether the agent remembers a concern, seeks discriminating evidence, and changes its assessment. Do not splice one candidate’s earlier conclusions into another’s trajectory.

Repeated trials still matter: reproducible inputs do not make model outputs deterministic. [Anthropic’s evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) emphasizes multiple trials, isolated environments, and the distinction between an agent’s transcript and the outcome it actually achieved. Use healthy recordings too; recommending intervention in every healthy run should not score well.

## Know where the recording ends

Captured raw events support more queries than a transcript of fixed API responses. Even then, unrecorded evidence remains unavailable. Keep replay recommendations isolated from production actions.

If a candidate recommends stopping the reconciliation job at hour twelve, a recording with that job still running cannot prove what happens after the intervention. Evaluating intervention effects requires a suitable simulator or controlled live experiment. Scheduled checkpoints also bound what you can say about detection time.

The point is to make a slow scenario reusable while preserving the information available at each decision. We can then improve the investigation without waiting another day for the same failure to develop.

[Local context for autonomous agents](https://oddly.fyi/writing/local-context-for-autonomous-agents/) describes the data layer that makes these reconstructed workspaces practical.
`
  }
];
