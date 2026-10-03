# The World an Agent Can Read

*How the shape of an environment changes what intelligence can notice.*

An agent arrives with considerable knowledge and very little understanding of where it has arrived. It may know how databases fail, how organisations make decisions, and how to search a repository. It still has to discover what things are called here, which records deserve confidence, and where an explanation might be hiding. Before it can reason well about a situation, it needs some way to encounter the situation in a useful form.

**Progressive disclosure** gives the agent a way into this unfamiliar world without requiring it to read everything. A small entry point reveals what is available. A more specific index exposes the differences that matter for a question. Detailed evidence enters the working context when the investigation needs it. A folder hierarchy alone does not achieve this; the agent must be able to choose which parts to open.

Consider an agent investigating why a service became slower after a release. The evidence exists, but the old incident report sits under the name of a team that no longer exists. A design discussion about retries is titled after a project codename. Neither uses the word “latency.” A search for the symptom finds a checklist covering CPU, memory, and database queries. Everything the agent reads is accurate. The route through it is incomplete.

Now give the incident report an index entry that mentions the original symptom: latency after a release, despite steady incoming traffic. Link it to the design discussion about repeated attempts. The agent can reach a different hypothesis: perhaps the release changed how often work was repeated. No fact about the present incident has changed. A previously difficult connection has become available.

“Contains information about deployment” would have added little beyond the filename. “Explains why a healthy rollout can still overload downstream services” offers a reason to enter. A useful entry remembers the language someone uses before learning the diagnosis.

## A small map, with useful doors

Here is an illustrative part of a knowledge directory for the slower-service investigation. Each folder has an index; the detailed explanations and incident records sit at the leaves. The names describe the subject and the kind of evidence available.

- `docs/`
  - `INDEX.md` — routes from symptoms and questions
  - `request-path/` — maintained explanations of request behaviour
    - `INDEX.md` — signals that distinguish competing explanations
    - `retries.md` — retry behaviour, measurements, and safeguards
    - `dependency-latency.md` — time spent waiting on dependencies
  - `cases/` — historical investigations
    - `INDEX.md` — cases indexed by symptoms and decisive evidence
    - `retry-amplification.md` — repeated attempts overloaded a dependency
    - `connection-pool-exhaustion.md` — requests waited for connections

The root index offers a choice the investigator can make before knowing the diagnosis. Its entries use relative links, so they remain navigable inside the repository:

```index-example docs/INDEX.md
# Knowledge index

- [Request path](request-path/INDEX.md): Slow requests, timeouts,
  or latency after a release. Explanations and distinguishing signals.
- [Past investigations](cases/INDEX.md): Similar symptoms with
  different causes. Evidence, decisions, and outcomes from earlier incidents.
```

The next index makes the choice more precise. Here is `request-path/INDEX.md`:

```index-example docs/request-path/INDEX.md
# Slow requests and timeouts

- [Retries](retries.md): Relevant when downstream attempts rise
  faster than incoming requests. Explains how repeated work amplifies load.
- [Dependency latency](dependency-latency.md): Relevant when individual
  dependency calls slow down. Explains timing and queueing measurements.
- [Retry incident](../cases/retry-amplification.md): Historical case
  of latency after a release; attempts per request separated the hypotheses.
```

The case index supplies another route into the same record. Its entries preserve what the investigator could observe before the cause was known:

```index-example docs/cases/INDEX.md
# Historical investigations

- [Retry amplification](retry-amplification.md): Latency after a release;
  stable incoming traffic, rising downstream attempts. Retries added load.
- [Connection pool exhaustion](connection-pool-exhaustion.md): Timeouts
  with normal query duration. Waiting for a connection dominated latency.
```

Those entries do three jobs: name a recognisable symptom, explain what the document contributes, and expose a difference that could matter. They leave the graphs, configurations, rejected hypotheses, and intervention results in the underlying records. Copying those details into every parent index would defeat the purpose.

At a leaf, I would want enough substance to challenge the analogy. In the illustrative retry incident, the record might show that incoming traffic remained steady, downstream attempts per request increased, and limiting retries reduced load. It would also record what was ruled out, which configuration was in use, and which effects the intervention failed to explain. A maintained reference should identify its scope, owner, and last review; a historical case should identify its incident date and environment. Neither label establishes what is happening in production today.

For “the service became slower after a release,” the agent could open the root index, compare the request-path entries, and read the retry incident. That would suggest inspecting current attempts per request. If attempts have not increased, the historical resemblance has weakened and the investigation should change direction. If they have, the agent has a reason to gather more evidence about retries. Reading the old case has earned a question, not a diagnosis.

This is one possible route. An agent with an exact error string may search directly for a leaf. Another may enter through the case index. The index itself can be incomplete or misleading: an explanation missing from the map may still be present in the evidence. The hierarchy offers orientation without making every intermediate document compulsory. Its depth should earn its keep: add a level when it helps distinguish choices, and flatten it when it merely adds another file to open.

## Test the routes, not just the records

Removing instructions leaves these choices of representation in place. An index organised by team assumes the reader knows who owns the problem; one organised by symptoms assumes the reader knows what has gone wrong. A folder called “best practices” gives its contents a different status from “historical investigations.” Names and omissions continue to steer attention. Making their assumptions visible gives the reader room to disagree.

Codebases teach through repeated patterns, but repetition alone cannot distinguish a considered design from a mistake copied forty times. A knowledge directory has the same problem. Records need to preserve the conditions and tradeoffs that made a decision reasonable, including what later changed.

A [study of repository context files](https://arxiv.org/abs/2602.11988v3) tested files such as `AGENTS.md` and `CLAUDE.md`, whose instructions and repository overviews were loaded into coding agents' context. Across its benchmarks, these files increased inference cost without a statistically significant improvement in task completion. The authors still recommend them for nonstandard project practices. Even the included repository overviews did not meaningfully help agents reach relevant files sooner.

That finding does not establish that `INDEX.md` files are useless. The study did not test the design proposed here: short indexes that an agent consults as needed to find detailed evidence. Their intended benefit is to make relevant material easier to discover while leaving unrelated detail outside the working context. This is a design hypothesis, not a result demonstrated by the study. Test comparable tasks with and without the indexes: does the agent find the right evidence, reach better outcomes, and do so at an acceptable cost? An index should earn its place through those results.

The service owner may search by component, a customer by failed action, and an investigator by error string. Those routes should converge on the same underlying record. Stable references preserve the connection when a team changes its name, without making several copies of the history.

There is a simple way to examine an environment through this lens. Choose one resolved problem and write three short descriptions of it: the customer's symptom, the operator's observation, and the expert's eventual diagnosis. Search the corpus from each description and follow the links. Do the routes converge on the relevant evidence? Or can only the expert, who already knows the answer, find the account? A document can be impeccably written and still fail this test.

Try improving one connection before writing another guide. Rename an obscure record, add the symptom it explains, or link two cases whose difference matters. Run the task again and examine whether the agent encountered a better question. The aim is to build a place where expertise remains discoverable even when the next problem arrives in unfamiliar language. That work begins with a modest act of imagination: seeing the environment through the eyes of something capable that does not yet know its way around.
