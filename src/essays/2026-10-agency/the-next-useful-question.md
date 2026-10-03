# The Next Useful Question

*Context becomes valuable when it changes a decision.*

An agent can finish reading a document and become better informed without becoming any closer to knowing what to do. It can repeat this across a dozen documents. The result looks like progress: more sources, fuller notes, a longer account of the system. The decision remains where it started.

This is an easy failure to reward. We can count searches, inspect citations, and see that the agent was busy. It is harder to ask whether the information it gathered could distinguish between the actions available to it.

That distinction matters whenever an agent chooses its own context. Progressive disclosure, explored in [The World an Agent Can Read](/writing/the-world-an-agent-can-read/), makes detailed knowledge available behind small entry points. It gives the agent somewhere to look. It still needs a reason to look there. This essay concerns that choice: which piece of evidence is worth bringing into context next?

Consider an illustrative example. An agent has been asked to produce a report from a customer data export. The export contains fewer records than expected. Several explanations remain plausible: the export stopped after its first page, a date filter excluded part of the period, or the agent's account cannot access some records.

The agent searches for “incomplete export.” It reads an overview of the reporting service, then a troubleshooting guide, then an old incident describing missing rows. These documents are relevant to the topic. None establishes which explanation applies to this export.

It requests the export again. The same rows arrive. It broadens its search. More information accumulates around an unchanged uncertainty.

A useful next observation might be the response metadata. Does the response contain a continuation cursor that was never followed? If so, pagination deserves immediate investigation. If the response indicates completion, an unfollowed page becomes less likely, though the meaning and reliability of that metadata still matter. The check has value because its possible results lead toward different actions.

This does not prove that response metadata should always be checked first. Perhaps the export format has no pagination. Perhaps the user has already supplied evidence that the date range is wrong. The example illustrates a relationship between uncertainty and action; it supplies no universal sequence.

In this version of the example, the saved response contains a `next_cursor`. Fetching the next page returns additional rows. The investigation has changed: the agent now needs to follow pagination and reconcile the completed export with its expected scope. Rewriting the date filter would have addressed the wrong problem. Even the cursor does not prove that every expected record is accessible; it establishes one cause of incompleteness.

The important relationship is compact: a plausible explanation, a decision that depends on it, and an observation that separates the available choices. An agent can maintain it without narrating a new plan before every request.

Nor should an agent minimize reading for its own sake. A short request can be useless. A lengthy design document may reveal an assumption that changes the entire investigation. The useful question is whether the expected benefit of another observation justifies its cost in time, effort, and delay. Sometimes that benefit is discovering a possibility the agent had not considered.

That last point prevents this approach from becoming too tidy. An agent that only tests its current hypotheses can miss the real cause completely. Early exploration should help it learn the shape of an unfamiliar system. Later requests can become more selective. If several checks fail to support any current explanation, the agent should revisit the explanations and expand its search.

There is also a point at which another answer would change nothing. If the remaining explanations all justify the same permitted, recoverable next action, the agent may know enough to proceed. Further reading can wait for a decision that actually depends on it. Conversely, an unresolved distinction deserves attention when one possible answer would make the proposed action inappropriate. A stopping rule should follow the consequence of uncertainty.

Anthropic's [context-engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) describes a practical combination of lightweight references and context loaded as work proceeds. It also acknowledges the tradeoff: autonomous exploration takes time and can follow dead ends. Progressive disclosure makes selective acquisition possible. The quality of the selection remains an engineering problem.

The research on skill discovery makes a related distinction visible. In [*How Well Do Agentic Skills Work in the Wild*](https://arxiv.org/abs/2604.04323), the benefits of skills weakened as agents faced more realistic retrieval and relevance conditions. In the hardest settings, performance approached the baseline without skills. Task-specific refinement recovered part of the lost performance when the retrieved material was reasonably relevant. This preprint studies particular models and benchmarks; it does not establish one preferred retrieval method. It does show why useful knowledge supplied directly and useful knowledge somewhere in a collection deserve separate evaluation.

I would test an agent's knowledge environment under four conditions. First, give it the decisive evidence directly. Second, make the same evidence available through its normal tools and documents. Third, add plausible material that resembles the task while differing on a consequential detail: an old export format, a different access model, or a superficially similar incident. Fourth, withhold the decisive evidence from every available source, so that an honest account of what remains unknown is the appropriate result.

The first condition checks whether the agent can use the evidence. The second adds the burden of discovery. The third adds the burden of rejecting an attractive analogy. The fourth checks whether the agent recognises the limit of what it can establish. Use the same task set, model, tool permissions, and resource budget across repeated runs. Score the evidence actually obtained and the action it justifies, including a justified decision to stop or seek missing information; a fluent plan earns little by itself. If the agent fails with decisive evidence already present, improving search alone is unlikely to solve that case.

The environment can help make useful questions answerable. An index should mention recognizable symptoms and applicability limits. A tool should expose the completion state, scope, and provenance of its result. A diagnostic utility should make a consequential distinction easy to inspect. Otherwise the agent may understand exactly what it needs to know and have no practical way to obtain it.

That is a concrete place to begin improving an agent: find a moment when it kept looking without learning anything that mattered. Ask what observation could have changed its next move. Then make that observation retrievable.
