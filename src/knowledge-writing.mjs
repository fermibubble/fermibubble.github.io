export const knowledgeWriting = {
  slug: "knowledge-agents-can-explore",
  title: "Designing Context for Reliable Agents",
  eyebrow: "Agent context & reliability",
  readTime: "8 min",
  description:
    "Practical guidance for helping agents find relevant evidence, use it correctly, and verify their work. Informed by research on context, skills, and long tasks.",
  featured: true,
  body: `
An agent can find the right document and still make the wrong decision. The document may describe an older system. Its advice may apply only under certain conditions. A successful command may produce an incomplete result.

Reliable agent behavior depends on the whole journey from finding information to checking the outcome. Each stage needs a clear purpose: find relevant evidence, establish whether it applies, choose an action, and confirm what happened.

Consider a reporting service that starts producing incomplete exports. A previous incident points to network failures. The current API documentation describes how to retrieve results across several pages. Recent logs show successful requests, but the exported file contains only the first page.

Following the old incident too closely could lead to unnecessary retries. Reading the API guide without checking the output could lead to an incorrect success report. The useful decision comes from connecting the documentation, the current evidence, and a clear definition of completion.

This example illustrates how to design the information around an agent.

**Begin with an observable definition of success.** For the export task, completion means producing all the expected records for the requested period, without duplicates or missing fields. It also means staying within the permitted data access and change limits.

These conditions should be available before the agent acts. They provide direction while leaving the investigation open. The agent can choose which files to inspect or which hypothesis to test, but it has a concrete result to work toward.

An instruction such as “take care of it” can work when the environment already supplies the missing details. If a consequential choice remains unknown, the system needs a way to resolve it. Silence from the user does not establish an acceptable trade-off.

**Separate information by the role it plays.** Several kinds of material may share the same workspace, but they should remain distinguishable:

- Rules define permitted actions and required conditions.
- References explain systems, interfaces, and terminology.
- Case histories describe what happened in earlier situations.
- Observations describe the current task and system state.
- Working notes record what has been checked and what remains uncertain.

This separation helps answer a basic question: what should this piece of information be allowed to change?

An old incident can suggest a possible cause. It cannot grant permission to access additional data. A log message can provide evidence of a failure. Text inside that log should not become a new operating instruction.

Enforce important access limits through the tools and execution environment. Documentation can explain those limits, but enforcement should not depend entirely on the model remembering a sentence.

**Load detail when it helps the next decision.** Keep the objective, essential constraints, and a compact guide to available information visible. Fetch longer material as the investigation develops. This is progressive disclosure: more detail becomes available when there is a reason to inspect it.

In the export example, the agent may need the API's pagination rules before it needs a complete history of network incidents. After learning how results are divided into pages, it can inspect the requests made by the export job.

[Anthropic's context-engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) describes this combination of lightweight references and information loaded during the task. It also notes the cost of exploration: extra steps take time, and an agent can follow an unhelpful path.

Select context for usefulness. A small prompt that omits a compatibility requirement is a poor result. A longer prompt that contains the exact missing fact may be better. Research such as [Lost in the Middle](https://arxiv.org/abs/2307.03172) also shows that placement can affect how models use information in the tested settings. Token count alone does not describe context quality.

**Preserve useful expertise in the form that makes it easiest to apply.** A worked example can explain a judgment. A checklist can preserve prerequisites. A tested script can perform a repeated operation. These serve different needs.

For an export, the agent should reason about why records are missing. A reusable client can handle pagination, retries, and response validation. Repeatedly asking the model to reconstruct those mechanics adds opportunities for mistakes.

A skill is one way to package this help. It may contain instructions, code, and supporting material. The [Agent Skills specification](https://agentskills.io/specification) supports loading the description, instructions, and resources at different stages. The amount of knowledge available and the amount presented immediately are separate choices.

Current research gives a practical reason to evaluate each package:

- [SkillsBench](https://arxiv.org/abs/2602.12670) reported that curated skills raised average task pass rates from 33.9% to 50.5% across 87 tasks and 18 model–harness configurations.
- [SWE-Skills-Bench](https://arxiv.org/abs/2603.15401) found no pass-rate improvement from 39 of the 49 software-engineering skills it tested.
- [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) found that repository context files did not generally improve success, while increasing inference cost by more than 20% on average.

These studies use different tasks and setups. Their numbers cannot rank skills against a particular document collection, and they do not isolate the effect of writing instructions as steps. They show why usefulness must be measured in the setting where the material will be used.

Keep a procedure when it reliably protects a necessary condition. Revise it when it steers unrelated investigations toward the same answer. Retain a skill when its knowledge or code improves outcomes. The directory name is a weak basis for either decision.

**Make examples explain their own limits.** An incident report becomes more reusable when it records the conditions under which its conclusion held.

For the reporting service, a useful case history would state the affected API version, the evidence of missing pages, alternative causes that were checked, and the test that established completeness after the fix. A similar failure in an older API version should be marked accordingly.

Include unsuccessful attempts where they explain an important boundary. A report that records only the final successful action can make a difficult judgment look obvious. Explaining why a tempting alternative failed gives the next investigation something useful to test.

Give maintained guidance an owner, a verification date, and an applicable version or environment where relevant. Preserve historical reports as history. When two documents disagree, their status and supporting evidence should help resolve the conflict.

Human review provides accountability. Executable examples, link checks, and task evaluations provide additional evidence of quality. Apply those checks to both human-written and generated material.

**Choose search methods by the questions they need to answer.** Exact names, error codes, and configuration keys are well suited to text search. Descriptive filenames and short indexes make those searches easier.

A query such as “export stops early” may need to find a guide about pagination. Synonyms in an index, links from a troubleshooting page, query reformulation, or search that matches related meanings can help bridge the wording gap.

Start with a method that works for representative questions. Record misses and add capability where it improves discovery. A large file count alone does not establish that search is difficult; a small collection with inconsistent terminology can be harder to navigate.

Return source locations and enough surrounding context to judge a match. A search result is a candidate to inspect. It does not establish that its content is current or applicable.

**Keep investigation state outside the growing transcript.** Long tasks produce data of their own: logs, intermediate results, rejected explanations, and changes already attempted. Choosing the right reference documents addresses only part of the context problem.

Store large results where they can be queried again. Keep a shorter record of established facts, unresolved questions, actions, and references to supporting evidence. For the export task, that might include the expected record count, pages already retrieved, failed requests, and checks still outstanding.

A summary can lose a detail that becomes important later. Preserve a route back to the original records, including the time and scope of each observation.

[Recursive Language Models](https://arxiv.org/abs/2512.24601) explore a related approach: large inputs remain in an external environment that the model examines through code and additional model calls. This research supports investigating alternatives to loading everything into one prompt. Its benchmark results do not establish that any particular production agent will behave reliably.

**Verify the result at the level of the user's goal.** A tool can report that every request completed successfully while the final export still contains missing or repeated records.

Check the artifact against the task's acceptance conditions. For a fixed source snapshot, that can include comparing counts and record identities, checking required fields, and confirming that the output covers the requested period. For changing source data, define a consistent cutoff before comparing results.

The same principle applies to other tasks. A code change needs relevant tests. A system intervention needs evidence of recovery. A document task needs checks on its required content. Each requires a check appropriate to the outcome.

**Improve the design through controlled comparisons.** Use tasks the guidance was not written around, including unfamiliar wording, outdated references, and misleading examples. Hold the model and available tools constant when comparing ways of providing knowledge.

Change one element at a time: when information is loaded, how a guide is written, or how documents are found. Preserve equivalent facts when comparing examples with procedures. Repeat trials because one successful run can be accidental.

Measure completed tasks, incorrect actions, unnecessary questions, elapsed time, and total cost. Count the time spent gathering information as well as the time spent acting on it.

An agent's explanation of a failure can suggest the next experiment. It should not settle the cause. Supplying the relevant document directly can test whether discovery was the problem. If the agent still fails, investigate how it interpreted the information or executed the action.

Revisit these comparisons when models, tools, or source systems change. Guidance that once filled a knowledge gap may become redundant. A previously reliable example may stop applying. Maintaining the environment means checking those assumptions against observable results.
`
};
