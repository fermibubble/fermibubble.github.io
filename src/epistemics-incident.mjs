/* Fictional incident: all timings and measurements are illustrative. */
export const incident = {
  "id": "042",
  "steps": [
    {
      "time": "10:00",
      "title": "The newest deploy is a suspect",
      "confidence": "Low confidence · timing alone",
      "observed": "Gateway 5XX is 12% and p95 is three seconds. Checkout was deployed two minutes earlier.",
      "belief": "The deployment may be involved. There is no causal evidence yet.",
      "next": "Compare failing routes and trace their dependencies.",
      "basis": [
        "gateway metrics",
        "deployment history"
      ],
      "scope": "Gateway symptoms; root cause unverified",
      "metricScope": "At the API gateway",
      "error": "12%",
      "latency": "3.0 s",
      "nodes": {
        "gateway": [
          "504 timeouts",
          "affected"
        ],
        "checkout": [
          "Recent deploy",
          "unknown"
        ],
        "catalog": [
          "Not yet checked",
          "unknown"
        ],
        "payments": [
          "Not yet checked",
          "unknown"
        ],
        "inventory": [
          "Not yet checked",
          "unknown"
        ],
        "database": [
          "Not yet checked",
          "unknown"
        ]
      },
      "label": "Alert",
      "revisit": "A shared dependency could explain failures beyond Checkout."
    },
    {
      "time": "10:03",
      "title": "Two APIs, one slow dependency",
      "confidence": "Moderate confidence · traces converge",
      "observed": "Checkout and Catalog both spend most of their request time waiting on Inventory. Payments stays fast.",
      "belief": "Inventory is the shared slow dependency. The trigger is still unknown: Checkout could also be overloading it.",
      "next": "Separate Inventory’s queueing time from database execution time.",
      "basis": [
        "Checkout traces",
        "Catalog traces",
        "Payments latency"
      ],
      "scope": "Both API routes; sampled request traces",
      "metricScope": "At the API gateway",
      "error": "12%",
      "latency": "3.0 s",
      "nodes": {
        "gateway": [
          "504 timeouts",
          "affected"
        ],
        "checkout": [
          "Waits on Inventory",
          "affected"
        ],
        "catalog": [
          "Waits on Inventory",
          "affected"
        ],
        "payments": [
          "Responses normal",
          "nominal"
        ],
        "inventory": [
          "Shared delay",
          "affected"
        ],
        "database": [
          "Not yet checked",
          "unknown"
        ]
      },
      "label": "Topology",
      "revisit": "Trace more requests; a shared delay does not identify what started it."
    },
    {
      "time": "10:06",
      "title": "The wait happens before the query",
      "confidence": "Leading hypothesis · mechanism and timing fit",
      "observed": "Inventory waits 2.4 s for a database connection; queries take about 20 ms. At 09:56, its pool limit changed from 40 connections to 4 per replica.",
      "belief": "The smaller connection pool is the leading explanation. Requests can queue before reaching an otherwise fast database.",
      "next": "Verify database headroom and restore the previous pool setting on one replica.",
      "basis": [
        "pool wait histogram",
        "database spans",
        "09:56 configuration diff"
      ],
      "scope": "Inventory pool; database capacity must be checked",
      "metricScope": "At the API gateway",
      "error": "12%",
      "latency": "3.0 s",
      "nodes": {
        "gateway": [
          "504 timeouts",
          "affected"
        ],
        "checkout": [
          "Waits on Inventory",
          "affected"
        ],
        "catalog": [
          "Waits on Inventory",
          "affected"
        ],
        "payments": [
          "Responses normal",
          "nominal"
        ],
        "inventory": [
          "Pool wait: 2.4 s",
          "affected"
        ],
        "database": [
          "Query time: 20 ms",
          "nominal"
        ]
      },
      "label": "Bottleneck",
      "revisit": "If restoring the pool does not reduce waiting, reconsider the diagnosis."
    },
    {
      "time": "10:10",
      "title": "An intervention tests the belief",
      "confidence": "Strong support · one replica, comparable load",
      "observed": "With database capacity checked, one replica gets its previous setting back. At comparable load, pool wait falls to 30 ms; unchanged replicas still queue.",
      "belief": "Strong evidence that the pool change caused the bottleneck. This canary—a trial on one replica—does not establish overall recovery.",
      "next": "Restore the setting across replicas and check end-to-end recovery.",
      "basis": [
        "canary pool metrics",
        "matched request traces",
        "unchanged replicas"
      ],
      "scope": "Requests routed through the canary; other replicas still affected",
      "metricScope": "Requests through the canary only",
      "error": "0.7%",
      "latency": "320 ms",
      "nodes": {
        "gateway": [
          "Global impact remains",
          "affected"
        ],
        "checkout": [
          "Canary improves",
          "affected"
        ],
        "catalog": [
          "Canary improves",
          "affected"
        ],
        "payments": [
          "Responses normal",
          "nominal"
        ],
        "inventory": [
          "One replica improves",
          "affected"
        ],
        "database": [
          "Query time: 20 ms",
          "nominal"
        ]
      },
      "label": "Canary",
      "revisit": "Check whether the improvement holds across replicas and request types."
    },
    {
      "time": "10:14",
      "title": "The trigger and the amplifier differ",
      "confidence": "Retry amplification likely · extra attempts measured",
      "observed": "After rollout, gateway p95 is 900 ms and 5XX is 2.8%. User traffic is unchanged, but traces show three Inventory attempts per original call on average.",
      "belief": "The pool change was a trigger. Upstream retries appear to be sustaining excess load after that trigger is removed.",
      "next": "Apply the approved retry budget, which caps extra attempts; watch queues and successful requests.",
      "basis": [
        "gateway latency",
        "attempts per request",
        "Inventory queue depth"
      ],
      "scope": "All replicas restored; upstream retries remain",
      "metricScope": "At the API gateway",
      "error": "2.8%",
      "latency": "900 ms",
      "nodes": {
        "gateway": [
          "Some timeouts remain",
          "affected"
        ],
        "checkout": [
          "Repeated attempts",
          "affected"
        ],
        "catalog": [
          "Repeated attempts",
          "affected"
        ],
        "payments": [
          "Responses normal",
          "nominal"
        ],
        "inventory": [
          "3 attempts per call",
          "affected"
        ],
        "database": [
          "Query time: 20 ms",
          "nominal"
        ]
      },
      "label": "Retries",
      "revisit": "If queues persist after retries fall, investigate another source of load."
    },
    {
      "time": "10:30",
      "title": "Verify recovery at the user boundary",
      "confidence": "Recovery observed · current traffic level",
      "observed": "For ten minutes at comparable incoming load, queues stay drained, p95 is 270 ms, and 5XX is 0.3%.",
      "belief": "Recovery is supported for this traffic level. Peak-load behavior and the reason the configuration changed remain unverified.",
      "next": "Continue monitoring and investigate how the pool configuration changed.",
      "basis": [
        "10-minute gateway window",
        "queue depth",
        "incoming traffic"
      ],
      "scope": "Observed load and time window; not a universal guarantee",
      "metricScope": "At the API gateway · 10-minute window",
      "error": "0.3%",
      "latency": "270 ms",
      "nodes": {
        "gateway": [
          "Near baseline",
          "nominal"
        ],
        "checkout": [
          "Requests recover",
          "nominal"
        ],
        "catalog": [
          "Requests recover",
          "nominal"
        ],
        "payments": [
          "Responses normal",
          "nominal"
        ],
        "inventory": [
          "Queue drained",
          "nominal"
        ],
        "database": [
          "Query time: 20 ms",
          "nominal"
        ]
      },
      "label": "Recovery",
      "revisit": "Reopen the incident if errors or queueing return, especially at higher load."
    }
  ]
};
