# Placement Changes the Promise

*A correct answer can still fail if it arrives too late or describes the wrong moment.*

An assistant is about to send a confidential report to an external address. A classifier correctly detects the problem—one second after the email has left.

The classification was right. The protection failed.

Placement determines what an answer can accomplish. The same classifier can be a gate before an action, a monitor after it, or an instrument in an offline test. Each position needs a different promise.

## The reader who is waiting

There are several useful places to embed a classifier in an assistant's workflow:

- **At the input:** Classify a request's intent before choosing a workflow. “Cancel my subscription” should reach account support rather than sales. The reader waits for routing.
- **After retrieving context:** Classify retrieved material for relevance or sensitivity before putting it into the model's context. This position can prevent unsuitable material from entering a later step.
- **Before a tool action:** Inspect the proposed action and its arguments. A classifier can flag an external recipient before the send operation is authorized. This is where a delivery gate can still prevent delivery.
- **Before showing the answer:** Inspect the generated response before the user sees it. For streaming output, check each releasable chunk before releasing it, or hold the response until the required check finishes. A check on the final text cannot protect text already displayed.
- **In the background after completion:** Label conversations for failure analysis, review queues, or trend monitoring. The user need not wait, but the result cannot undo a completed action.
- **In an offline evaluation:** Apply a fixed rubric to recorded cases to compare versions. If the question is whether an action was justified at the time, supply only evidence available then.

```classifier-figure
{"type":"steps","title":"Where a check can still change the outcome","items":[{"title":"Request arrives → route it","text":"Input classification chooses the appropriate workflow."},{"title":"Context arrives → inspect it","text":"Check what will enter the model's context."},{"title":"Action proposed → gate it","text":"Check the recipient and report before the send tool executes. Hold the action until the decision arrives."},{"title":"Answer prepared → check it","text":"Inspect the user-facing response before release."},{"title":"Episode complete → learn from it","text":"Background review and offline replay examine the record and improve future behavior."}],"note":"The send action and the user-facing answer are separate releases. Checking the answer does not retroactively authorize or stop the email."}
```

For every inline check, write down three things: **what waits, how long it can wait, and what happens if the answer never arrives.** A routing timeout might open a general support flow. A confidential-send timeout might hold the message for review. The fallback belongs to the policy; a timeout must not silently become `SAFE`.

Background work has a different budget: cost, backlog, and time until an issue becomes visible. Offline evaluation has a different evidence boundary. A classifier judging a noon decision must not see facts first discovered at 12:05. [Checkpoint Replay for Long-Horizon Agent Evaluation](/writing/checkpoint-replay-for-agent-evaluation/) explores this distinction between what was available then and what became known later.

## The label has a pipeline

A prompted classifier does more than send a prompt. It selects an input, assembles context, asks a model, parses the response, validates labels, applies thresholds, and stores a result.

Each step can lose something important. Truncation can remove the recipient address. A parser can reject a valid judgment because its format is wrong. A threshold can remove every candidate label.

Keep these outcomes distinct:

- **No category applies:** the classifier completed and explicitly found none of the defined conditions.
- **Insufficient evidence:** it could not support a substantive judgment.
- **Below threshold:** it proposed a candidate that the acceptance policy withheld.
- **Execution failure:** a timeout, tool error, or invalid response prevented a usable result.

An empty list cannot explain which of those happened. Store the status and the relevant accepted and rejected result, within retention rules, so the downstream policy can respond deliberately.

## Measure service and judgment separately

A classifier can return perfectly formatted answers on time and still be wrong. It can also make good judgments too slowly to help. Test both properties.

For the send gate, try a permitted report, a confidential report, a slow check, an invalid label, and an inconclusive judgment. Inspect whether the message is actually sent, held, or routed to review in each case. Then independently measure whether its classifications match the reference evidence.

The promise is concrete: what the classifier sees, which action waits for it, and how the workflow behaves when a reliable answer is unavailable.
