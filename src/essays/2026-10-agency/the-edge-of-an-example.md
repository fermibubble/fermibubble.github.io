# The Edge of an Example

*What a past success teaches—and where its authority ends.*

A successful example arrives with an unfair advantage: it has already worked. The uncertainty has been resolved, the sequence makes sense, and the ending lends authority to everything that came before it. Read enough successful investigations and it becomes tempting to believe that expertise consists of recognizing which familiar story is happening again.

That is part of expertise. It is also where expertise becomes brittle.

A successful action belongs to a particular situation. The story may preserve the action beautifully while losing the conditions that made it appropriate. We remember that someone restarted a service, tightened a filter, or retried a delivery. We are less likely to remember the small observation that made this choice reasonable—and the observation that would have made it a mistake.

This matters when we teach an agent through examples. A collection of real work contains more texture than a collection of instructions. It shows names, conventions, useful tools, and the kinds of details experienced people attend to. But a case history is still an incomplete account of a decision. Several explanations can fit the same successful sequence. The reader has to infer which one carries forward.

Imagine a warehouse dashboard showing two dispatch records against the same order. An agent searches the incident archive and finds an apparently excellent match. Months earlier, a message had been delivered twice, producing two dispatch jobs. The team added a check that suppressed subsequent dispatches for an order, and the duplicates disappeared. The case is concise, specific, and supported by a successful outcome.

There is a detail the account barely mentions: at the time, every order shipped as a single parcel.

The warehouse now supports split shipments. A large order can leave from two locations, with a separate dispatch for each parcel. The dashboard looks almost exactly as it did during the earlier incident. Applying the old fix would make the dashboard look healthy while preventing part of the customer's order from leaving the building.

Both situations contain repeated order identifiers. The difference is what the repetition means. In the earlier case, one event had been processed twice. In the later case, two legitimate events share a parent order. The useful question is whether the records refer to the same parcel and dispatch event. Counting order identifiers cannot answer it.

The original case can teach two very different lessons. One is that repeated dispatch records should be suppressed. The other is that a repeated record becomes a duplicate only relative to the thing that is supposed to be unique. The first lesson resembles a fix. The second gives the reader a way to decide whether the fix belongs here.

An archive containing twenty versions of the first incident may strengthen the wrong lesson. Repetition increases familiarity without necessarily revealing the hidden assumption. A single contrasting case can expose it immediately. The value of that case comes from changing what the reader notices.

I think this is an overlooked dimension of a knowledge collection: how well its examples disagree with one another.

We usually curate for quality within each document. Is the account accurate? Is the explanation clear? Did the intervention work? Those questions matter. We should also curate the relationships between documents. Which two cases appear interchangeable until one observation separates them? Where does an otherwise sensible action become harmful? Which familiar symptom belongs to several distinct mechanisms?

There is a trap in constructing these pairs after the outcome is known. An author can select the one detail that makes the resolution look inevitable. Preserve what was observable at the decision point, distinguish invented counterexamples from historical evidence, and test the proposed distinction on cases that were not used to choose it. A tidy contrast can be another form of hindsight.

This also changes how I would write an individual case. I would spend less space making the sequence feel inevitable. I would preserve the fork: the moment at which two explanations remained plausible, the observation that separated them, and the consequence for the next action. A good account lets the reader encounter a decision before learning how it ended.

There is a useful discipline here for human authors. Ask what smallest plausible change would reverse the recommendation. If the records describe separate parcels rather than the same dispatch, that difference belongs near the center of the explanation. If the answer is “nothing would change it,” the claim may be unusually general—or its limits may not yet have been examined.

The same question helps distinguish a precedent from a causal explanation. A precedent establishes that an action accompanied success in some previous setting. A causal explanation attempts to say why the action helped, which conditions mattered, and what should happen when those conditions change. A collection should make room for both, with appropriate modesty about how much each case establishes. Recovery after an intervention can leave several explanations alive.

The warehouse example also reveals something deeper than a missing exception. The unit of reasoning changed. An order once corresponded to a single dispatch; now it can contain several. The word “duplicate” stayed the same while the entity whose identity mattered changed beneath it. Reusing the old answer requires noticing that a familiar concept has acquired a different structure.

I would test this with one pair of histories that readers routinely confuse. Put their initial symptoms side by side and identify the assumption that permits an action in one case and prevents it in the other. Add the observation that would reverse each recommendation. Then hide the resolutions and present an unfamiliar case near the boundary. Ask which additional fact would determine the action. A second unfamiliar case should turn on a different fact, such as a cancellation, so that remembering to inspect parcel identifiers is insufficient. Choosing the distinguishing observation shows more than a fluent retelling of either history.

A knowledge collection can grow through this kind of careful opposition. Each addition can make an existing example more precise, rather than merely making the archive larger. Over time, the collection begins to communicate where familiar solutions belong and where their authority ends. That is something I would want an agent to inherit: the ability to recognize an old pattern, then ask the question that could break it.
