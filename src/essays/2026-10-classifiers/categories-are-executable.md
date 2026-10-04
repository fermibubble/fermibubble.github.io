# Categories Are Executable

*The boundary between two labels is part of the system's behavior.*

Two engineers read the same support conversation. One labels it `ACCESS_PROBLEM`; the other chooses `CONFIGURATION_PROBLEM`. Both can defend the answer. The access failure was caused by a configuration change.

The team tries a larger model. It now produces longer explanations for the same disagreement.

The difficulty lives in the categories. One describes an observed symptom; the other describes a possible cause. They do not divide the world along the same dimension. No amount of confidence can make them mutually exclusive.

## Decide which question the labels answer

A taxonomy is a structured set of distinctions. Before writing names, decide whether it describes intent, symptoms, causes, outcomes, or ownership. A conversation can contain all five, but a single flat list can blur their relationships.

For an incident, `PERMISSION_DENIED` might describe an observation, `ROLE_REMOVED` a supported cause, `EXPORT_INCOMPLETE` an outcome, and `IDENTITY_TEAM` a routing destination. Each can be useful. Combining them into one required answer forces the classifier to choose between different questions.

Use a single label when the categories are alternatives for the chosen unit of analysis. Use several labels when several answers can be true. Separate fields can be clearer when the answers belong to different dimensions. A hierarchy helps when readers need both a broad grouping and a specific diagnosis, but its parent relationships should be explicit data.

The unit matters too. A turn can fail while the conversation eventually succeeds. A task can succeed for one requested file and fail for another. Define what receives the label before arguing about its name.

## Write the boundary, then test it

A category definition needs more than a positive example. It needs the neighboring case that should receive a different answer.

Consider two illustrative definitions:

- **Authentication failure:** the system cannot establish the caller's identity. An expired login credential belongs here.
- **Authorization failure:** the caller's identity is established, but the requested action is not permitted. A recognized account lacking a required role belongs here.

An error message saying only “access denied” establishes neither distinction by itself. The classifier needs more evidence or an explicit way to leave the cause unresolved.

For each important boundary, write a pair of examples differing in one decisive fact. Have independent readers apply the definitions. When they disagree, inspect which evidence and interpretation produced the split. Their disagreement may expose a category problem, insufficient context, or a real ambiguity that deserves preservation.

In a prompted classifier, these descriptions directly influence predictions. Editing “any mention of delay” to “delay that prevents completion” changes the decision rule even if the label name stays fixed. Review and version that sentence as carefully as a condition in ordinary code.

## Give the remainder a meaning

`OTHER`, `UNKNOWN`, and an empty result should have different jobs. A case outside the taxonomy is different from a case with insufficient evidence. Both differ from a failed model call.

A growing `OTHER` category can teach the team something. Examine its contents before adding labels. Perhaps a genuinely new task has appeared. Perhaps an existing definition is too narrow. Perhaps the classifier stopped receiving the relevant context.

Every new category creates a continuing obligation: collect examples, explain its boundary, evaluate it, and decide who uses it. A taxonomy with hundreds of elegant names can still leave most of its distinctions untested.

I would begin with the fewest distinctions that change a useful decision. Split a category when its children need different treatment and the evidence can support the separation. The result should make a reader's next judgment clearer, not merely make the catalog longer.
