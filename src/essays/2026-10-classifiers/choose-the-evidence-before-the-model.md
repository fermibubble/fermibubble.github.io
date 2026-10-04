# Choose the Evidence Before the Model

*The right decision rule depends on what must be learned before a label can be justified.*

A request router sees “Please move this to tomorrow.” It has to choose among scheduling, task management, and travel. The words alone do not identify what “this” refers to.

A more capable model might make a better guess. A classifier with access to the preceding message might not need to guess at all.

Model selection and evidence design are often mixed together. Separating them makes the choice among rules, trained models, prompted models, and agents much easier to explain.

## Four ways to reach an answer

**Explicit rules** work when the distinction can be written down and the required evidence is available. A verified product identifier can map directly to a product label. A rule is reproducible, inspectable, and usually cheap. It inherits every omission in its definition: a keyword match can mistake a quotation or a negation for an actual request.

**Trained classifiers** learn a boundary from labeled examples. They can be attractive when the task is stable, representative examples exist, and repeated inference must fit a tight budget. The important asset is the relationship between training data and future inputs. A familiar architecture trained on the wrong population learns the wrong regularities efficiently.

**Prompted classifiers** express definitions and examples in natural language and ask a general model to apply them. They make new categories easy to prototype. The prompt, supplied context, model version, and output processing all participate in the behavior. Easy editing creates a need for disciplined evaluation.

**Agentic classifiers** gather additional evidence before deciding. They might inspect a failed job, read related files, or query a system of record. Their advantage comes from access to observations that a fixed input lacks. Their cost includes tool reliability, latency, permissions, and the possibility of searching without resolving the question.

These are useful engineering patterns, not four mutually exclusive species. A production system can combine them.

## Buy more evidence only when it helps

Return to the ambiguous request. A fixed rule cannot resolve the reference. A prompted model with the conversation history might identify an existing calendar event. An agent might need to retrieve the event when the history contains only a reference.

Each step should earn its cost by resolving a consequential uncertainty. If the input already contains an authoritative product ID, sending it through a reasoning loop may add expense without useful information. If the missing fact exists only in another system, repeatedly rewriting the prompt will not supply it.

The [SetFit paper](https://arxiv.org/abs/2209.11055) offers one concrete reminder to test modest trained approaches: it studies efficient few-shot classification using sentence transformers and a classification head. Its results concern particular datasets and comparisons; they do not establish a universal winner over prompted models.

## Evaluate the whole route

A hybrid might apply exact rules first, use a model for the remaining cases, and ask a person when evidence stays insufficient. Measure both the stages and the completed system.

The model now receives a selected, harder population. Its quality on that remainder cannot be inferred from its score on random traffic. The fallback may also conceal failures: if every difficult case goes to a person, excellent automated precision can coexist with almost no useful automation.

Compare approaches on the same held-out inputs, label definitions, and available evidence. Record correctness, unanswered cases, latency, and cost. For an agent, also preserve which observations it actually obtained. A plausible rationale does not prove that a tool result supported the label.

This connects classification to [The Next Useful Question](/writing/how-intelligence-finds-its-way/the-next-useful-question/): the value of another observation depends on whether it can change a decision. Start there. Then choose the least costly mechanism that can obtain and use the evidence reliably.
