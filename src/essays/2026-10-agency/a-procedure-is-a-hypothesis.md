# A Procedure Is a Hypothesis

*Every method assumes a world in which it works.*

A procedure usually arrives as a sequence: inspect this, change that, check the result. Its form suggests that the difficult thinking has already happened. Follow the sequence and the outcome should follow. Hidden inside that expectation is a claim about the world: these observations mean what we think they mean, these actions have predictable effects, and the circumstances that made the method successful still hold.

Some steps have a necessary dependency: a new representation must exist before readers can use it. Other steps reflect a convenience that became a convention. A procedure often gives both the same grammatical form. Once a situation changes, the reader needs to distinguish what must remain ordered from what can be revised independently.

This is a useful way to think about what an agent should learn from procedures. Each one offers a hypothesis about how to accomplish something under particular conditions. Expertise includes recognizing those conditions, noticing their absence, and understanding which parts of the method survive a change. An agent that can execute the steps has acquired only part of that expertise.

Consider a service migrating event times from strings into a typed timestamp column. The established method is sensible: add the column, enable compatible writes to both representations, backfill older records without overwriting newer writes, compare results, move readers, and eventually remove the old field. There are good reasons for the order. It allows gradual deployment and gives engineers time to find discrepancies before the old representation disappears.

Suppose that, midway through the backfill, an agent encounters a group of records whose times shift by several hours. The migration is technically healthy. Row counts agree. Every string parses. The new column satisfies its constraints. But an upstream integration has changed: some strings represent local time, while the original producers supplied UTC. The old field never recorded this distinction because nobody previously needed it.

The procedure assumed that each stored value identified an unambiguous instant. That assumption was doing more work than any individual step. Casting strings correctly cannot recover information they never contained. Repeating the backfill with a different parser might produce cleaner output while preserving the mistake.

A capable agent should recognize that the evidence has changed the problem. It could inspect producer versions, compare affected records against independent events, and establish which records can be interpreted reliably. Some might be recoverable from their source and creation date. Others might remain ambiguous. The migration can retain the source string and mark unresolved conversions separately, keeping them out of the verified timestamp set. A decision from whoever owns the data's meaning may still be necessary. Completing the original sequence would conceal an unresolved question.

Notice how much of the procedure remains useful. Gradual rollout still matters. Comparing representations still matters. Preserving the original field becomes even more valuable. Revision need not mean abandoning accumulated expertise. It requires understanding which recommendations depend on the failed assumption and which have independent justification.

This distinction matters when we talk about instruction-following models. A strongly worded sequence can encourage an agent to interpret a discrepancy as something to overcome so it can finish the assigned steps. That is a problem in how the task has been framed. It does not establish that procedural knowledge suppresses reasoning. Often, reliable instructions save the agent from reconstructing details that other people have already worked out.

Research on external agent knowledge supports that more modest view. [SkillsBench](https://arxiv.org/abs/2602.12670v4) finds that curated packages of expertise can improve task performance, with benefits depending on their content and scope. These packages contain multiple kinds of material, so the results do not identify procedural prose as the source of improvement. They do give us reason to preserve useful expertise and investigate how an agent selects and applies it.

Calling a procedure a hypothesis also changes what we expect its documentation to contain. The record of a successful migration tells us what happened once. To reuse the method, we need to know why its authors expected those actions to work. Which properties of the data mattered? What could the comparisons detect? What would have made them postpone the change? A short explanation of these dependencies may transfer more judgment than several additional pages of instructions.

There is a practical limit to how much judgment should be expressed in prose. Once the mechanics are stable, they can become tested code. A backfill utility can make writes resumable, bound its batches, preserve source values, and report conversion failures consistently. The agent still has to decide whether the conversion is appropriate and whether the reported checks establish what matters. Code makes the chosen operation dependable; its tests describe only the properties someone thought to test.

This leaves room for firm requirements. Preserving recoverability may be essential even when the method changes. Revising a method does not give the agent authority to discard its required outcome or safeguards. Documentation helps by explaining the relationship: retain the source values because later evidence may reveal an incorrect interpretation. The reason gives the constraint meaning across situations that the original author never anticipated.

The timestamp migration gives us a specific test. Introduce records that invalidate the assumption of an unambiguous instant. Can the agent identify the broken assumption, separate interpretable records from unresolved ones, and explain what additional evidence would permit conversion? Row counts and successful parsing cannot establish that the times are correct.

Then inspect what the agent preserved. Source values, concurrency-safe writes, gradual deployment, and comparison still have sound reasons. An agent that abandons every safeguard has failed differently from one that repeats the original sequence. Understanding a method means knowing which part has stopped making sense—and which parts have become more valuable because of it.
