# The Freedom to Try Again

*Recoverability changes the kind of autonomy we can afford.*

A queue is growing. Customer reports that usually finish quickly are taking longer, and an agent has been asked to investigate. The workers appear busy. Increasing their concurrency seems reasonable. Perhaps too few jobs can run at once. Perhaps the workers are already overwhelming the database, and letting more jobs run will make the queue grow faster.

Both explanations fit the first observation. The agent can read more logs, inspect recent changes, and compare metrics. A replay or isolated test may settle the question with less disruption. Suppose those sources leave a consequential uncertainty about behaviour under the current shared load. A live experiment now has a reason to exist.

What happens next depends on the environment we have built around it.

Suppose the agent can change only one global concurrency setting. Every experiment affects every worker. Restoring the previous value is straightforward, but the intervening slowdown may reach all customers. The agent needs substantial confidence before acting because a mistaken hypothesis is expensive to test.

Now suppose it can direct a small share of jobs to a separate worker pool, cap that pool's database connections, and change its concurrency for a short interval. It can observe completion time, database wait, and errors alongside an unchanged pool. It can stop the experiment and restore only that pool's setting.

The model has the same uncertainty. The available experiment has changed. Within an authorised scope, it can investigate a plausible explanation while keeping several possible next moves available. That scope needs a budget for the whole investigation: repeated small trials can accumulate substantial delay, resource cost, and customer impact.

This is a practical way to expand an agent's independence. Give it actions whose consequences it can observe and contain, and whose effects it can repair. More questions become answerable through small experiments. The agent needs less certainty about the first hypothesis because being wrong leaves it able to investigate the next one.

The design of the experiment matters as much as its size. Before changing concurrency, the agent should know what the competing explanations predict. If workers lack parallelism, completion should improve without a corresponding rise in database contention. If the database is saturated, extra concurrency may increase waiting while completed work barely changes. A useful experiment makes those possibilities easier to distinguish.

The unchanged pool provides a comparison, although it cannot remove every ambiguity. Traffic changes. Jobs differ in complexity. Both pools may share a database, so the experiment can affect its own comparison. Connection limits and a short duration help contain that interaction. The result still needs interpretation. A small intervention can be inconclusive, and that is a legitimate result to preserve.

Recoverability also changes the value of a failed attempt. Suppose database waiting rises and throughput falls. Returning the setting to its previous value leaves the agent with evidence against increasing concurrency under those conditions. The next question concerns the source of contention: are jobs waiting for connections, locks, or long-running queries? Without a dependable return path, the second investigation begins amid the consequences of the first. The agent must distinguish the original problem from the problem it just introduced.

The [STRATUS research](https://arxiv.org/html/2506.02009v2) explores this relationship in agents that mitigate cloud failures. In a small evaluation involving thirteen mitigation problems, its ability to undo unsuccessful changes and try another approach helped substantially compared with retrying from the state left by a failed attempt. The advantage was not uniform: on another benchmark, retrying helped while undo added no measured success-rate gain. The results give a concrete reason to test recovery as part of an agent's environment. They do not establish that arbitrary production changes can be safely reversed.

That qualification becomes clear when we follow a job through the queue. A worker reads data, generates a report, stores the file, and sends the customer a notification. We can restore the worker's configuration. We may be able to discard an unpublished report. A notification already delivered has entered someone else's world. A later correction adds another event; it cannot remove the first.

Even the reversible part has a history. A brief overload consumes capacity and delays other work. Returning concurrency to its original value does not return the minutes customers spent waiting. The useful question is how much of the experiment's effect can be recovered, how quickly, and what will remain afterward.

This suggests changes to the application itself. Report generation can be separated from delivery, allowing trial outputs to remain unpublished while their quality is checked. Repeated jobs can carry stable identifiers that the delivery layer uses to suppress duplicate notifications. The experimental pool can have a resource ceiling that remains enforced even if the agent misjudges the results. Each choice creates room to learn before a consequence spreads further.

The return path needs equally careful design. Saving an old configuration file is insufficient if another operator changes it during the experiment. Restoring the entire file could erase their work. A scoped repair records which setting changed, its previous value, and the version produced by the change. Before restoring it, the system checks whether that part of the state still belongs to the experiment. Concurrent changes may require reconciliation.

There is also a point at which observation becomes commitment. The canary may look healthy while expensive jobs have yet to finish. Expanding it too early spends the options the small experiment preserved. The agent needs observations that cover the effects it expects to unfold, including downstream pressure and delayed failures. Recovery has a duration, and some return paths close over time.

For the queue, a successful investigation might therefore end with a modest configuration change, a rejected hypothesis, or a better question. Each can justify the experiment if the information gained was worth its effects and the remaining system is still workable.

Before adding another action to an agent, write down what that action can change. For each item, identify the observation needed before execution, the observation that would reveal its effects afterward, and the repair that would actually be possible. Walk that inventory through the worker, the database, the stored report, and the customer's inbox. Try the repair on an unsuccessful experiment.

The most revealing entries may be the effects that remain after a successful repair: a delayed job, capacity already consumed, a notification someone has read. An environment that supports experimentation must account for that residue. The freedom to try again depends on what the first attempt leaves possible.
