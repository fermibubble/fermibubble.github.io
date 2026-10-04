# Placement Changes the Promise

*A correct answer can still fail if it arrives too late or describes the wrong moment.*

An agent is about to send a report. A classifier checks whether the report contains material that should be withheld. It identifies a problem correctly, one second after the report has left.

The classification was correct. The protection failed.

Placement determines what an answer can accomplish. An inline check influences an action while it is still preventable. A background classifier describes events that already happened. An offline evaluation compares behavior on recorded cases. These placements can share a model and taxonomy while requiring different contracts.

## The reader who is waiting

For an inline classifier, latency belongs to the user's experience and often to the control mechanism itself. Define the point at which an action becomes irreversible, the evidence available before it, and the latest useful arrival time for the label.

Also define what happens on timeout. Proceeding, blocking, and requesting review have different costs. A missing answer should not quietly become a substantive category such as `SAFE`. Preserve the failure state so the policy can respond deliberately.

A background classifier has more room to investigate. Its constraints move toward cost, backlog, sampling, and the delay before an issue becomes visible. Those freedoms do not make it a preventive control. A nightly review can discover a harmful action; it cannot retroactively stop it.

An offline evaluation can use a fixed dataset and reference labels. It must still match the decision being tested. A classifier judging whether an agent should have acted at noon should not receive evidence collected at 12:05. That would reward hindsight. [Checkpoint Replay for Long-Horizon Agent Evaluation](/writing/checkpoint-replay-for-agent-evaluation/) develops this same boundary between the evidence available then and the outcome known later.

## The label has a pipeline

The behavior of a prompted classifier extends beyond its prompt. An input is selected, context is assembled, a request is rendered, a model answers, the response is parsed, labels are validated, thresholds are applied, and a result is stored.

Each step can change the meaning of the final row. Truncation can remove the observation that distinguishes two classes. A parser can reject an otherwise useful answer. A threshold can remove every candidate. A single-label adapter can resolve a tie using an ordering nobody intended to be authoritative.

Suppose a model returns a valid label with a score below the configured cutoff. The stored result becomes an empty list. That differs from a successful classification asserting that no category applies. It also differs from a timeout or invalid response.

Represent those outcomes explicitly. Keep enough of the raw and accepted result to understand why they differ, subject to the system's data-retention requirements. Otherwise a dashboard may show no processing errors while silently losing all of its useful labels.

## Measure service and judgment separately

Operational measurements ask whether requests completed, results were well formed, and decisions arrived on time. Semantic measurements ask whether the categories were right for their intended use. Both matter; one cannot substitute for the other.

For an illustrative inline router, I would test a normal response, a slow response, an invalid label, an empty result, and an uncertain but valid result. For each, I would inspect what the user actually experiences. Then I would evaluate label quality against independently prepared references.

The result is a contract that survives contact with execution: what the classifier knows, when it knows it, and what the rest of the system does when knowledge fails to arrive.
