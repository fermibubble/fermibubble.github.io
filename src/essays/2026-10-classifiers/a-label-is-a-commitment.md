# A Label Is a Commitment

*A category becomes consequential when another system starts acting on it.*

An assistant finishes investigating a failed data export. Every tool call succeeded. It produces a confident explanation and a link to a file. A classifier marks the task `RESOLVED`.

The file contains only the first page of records.

The label travels farther than the conversation. It enters a success-rate dashboard, removes the episode from a review queue, and becomes an example of satisfactory behavior. One compact word has made three different systems less likely to notice an unfinished job.

This is an illustrative case, but the design problem is ordinary. A classifier compresses evidence into categories that other people and systems can use. Compression makes aggregation and action possible. It also removes detail. The important question is which distinctions survive that removal.

## Four choices inside one word

A classifier assigns an input to categories from a defined label set. It might recognize products mentioned in a conversation, route a support request, or identify a failure in an agent's behavior. Four choices make its contract understandable.

- **The label set:** which answers exist, what they mean, and whether several can apply together.
- **The decision rule:** how the answer is selected, using explicit rules, a trained model, a prompt, or an agent that gathers evidence.
- **The placement:** when the classifier runs and who depends on its answer.
- **The measurement:** which reference judgments and tests establish whether its labels are useful.

These choices can fail independently. A better model cannot recover a category that the taxonomy never defined. A careful taxonomy cannot compensate for missing evidence. A correct label delivered after an irreversible action may arrive too late. A functioning pipeline can faithfully store mistaken answers.

For the export example, the first question is what `RESOLVED` promises. Does it mean the assistant answered? That its tools returned successfully? That the requested artifact exists? Or that the artifact satisfies the user's requested scope? Those definitions can produce different labels for the same episode.

## Decide what may follow

The same prediction can support different actions. A tentative failure label might be useful for selecting examples for human review. Automatically excluding an episode from a quality report needs a different justification. Blocking a user's next action needs another.

Keep the observation and the action distinguishable. The classifier can report that the available evidence supports `INCOMPLETE_EXPORT`. A downstream policy decides whether to request more evidence, notify a reviewer, or stop delivery. That separation lets the organization change its response without quietly changing the meaning of the category.

It also reveals a common mistake: assuming that a classifier good enough for a dashboard is good enough to control a workflow. A dashboard can tolerate some errors that an individual user cannot. Aggregation and intervention impose different costs on the same confusion.

## Ask what disappeared

A useful label record retains a route back to its input, the version of its definition, and any uncertainty that changes how it should be used. It need not carry the whole conversation. It should make the original judgment inspectable.

Return to the export. A record saying “resolved under rubric v2; completion inferred from successful tool calls” gives a reviewer something to challenge. A bare success flag hides the assumption that did the damage.

Before improving the classifier, I would write the next action beside each label. Then I would ask what evidence must be present for that action to be justified. This often changes the label definitions before it changes the model.

That is where the engineering begins: decide what a category commits its consumers to believing, and preserve enough evidence to revise the commitment.
