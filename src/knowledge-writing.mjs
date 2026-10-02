export const knowledgeWriting = {
  slug: "knowledge-agents-can-explore",
  title: "Give Agents Knowledge They Can Explore",
  eyebrow: "Agent knowledge & reasoning",
  readTime: "7 min",
  description:
    "Good examples, simple navigation, and clear checks help an agent decide what to do next. The details of how we provide that knowledge matter.",
  featured: true,
  body: `
An agent is asked to find out why an application has become slow. Before it takes its first useful action, we could hand it every troubleshooting guide, every tool description, and a long checklist covering every possible cause.

We could also give it a short introduction to the system, a way to find relevant material, and access to the evidence. It can then investigate and bring in more information as the problem becomes clearer.

I prefer the second approach. It gives the agent room to choose its next step. Making that work requires care in how we organize knowledge, explain decisions, and check the result.

**A useful starting point is how an experienced engineer joins a team.** They already understand software. What they need is the local picture: how this system works, what has failed before, which tools are available, and which rules matter here.

A mature codebase provides much of that picture. Existing code shows naming conventions, error handling, and common patterns. Tests show which behavior must be preserved. Previous changes show how the team solved related problems.

We can give an agent a similar environment. A small set of entry points can lead to system descriptions, past investigations, working scripts, and explanations of important decisions. The agent reads what is relevant as the task unfolds.

That is the useful idea behind treating knowledge as a codebase: make it easy to explore, connect, and check.

**Information can be available without being loaded into the conversation.** A file can sit in the workspace until the agent needs it. The same is true of a tool description or a long investigation report.

This is often called progressive disclosure. The phrase simply means revealing more detail when it becomes useful. Think of the working context as a desk and the workspace as a filing cabinet. The agent brings the relevant files onto the desk as it works.

For our slow application, it might first check when the problem began. A recent configuration change could lead it to the application settings. Database errors could lead it to connection metrics and a previous incident. Each observation helps it choose the next question.

The point is to improve the information available for that decision. A smaller prompt is useful only if it still contains what the agent needs. Leaving out a critical fact is no victory for efficiency.

[Anthropic describes a similar approach](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): keep lightweight references available and let the agent load material as it works. The same article acknowledges that exploration takes time and can go down the wrong path. Good navigation still matters.

**Examples are most useful when they explain why the action made sense.** Imagine an earlier incident with the same symptom:

> The application became slow after we increased the number of running instances. Each instance opened database connections. Together, they exceeded what the database could handle. We reduced the connection limit per instance. Connection errors stopped, and response times recovered under normal traffic.

This is an illustrative example, but it contains several useful lessons. More application capacity can put extra pressure on a shared dependency. A database error has a cause that needs investigating. Recovery needs to be observed after the change.

The current incident might have a different cause, such as an expensive query. The old report supplies a hypothesis. The agent still needs evidence that the explanation fits today.

A strong report also records what the team ruled out, which assumptions mattered, and when the chosen action would have been inappropriate. Those details help the agent carry a lesson into a different situation without copying it blindly.

I would make those decisions explicit. An important condition should not depend on the agent noticing an unstated pattern across forty examples.

**Some instructions leave room for judgment. Others describe conditions that must hold.** These two statements have very different value:

- Whenever an application is slow, restart it.
- Before changing a shared resource, establish which services depend on it.

The first jumps to a particular intervention. The second identifies information needed to make a responsible decision.

An agent can investigate freely while using a checklist for a delicate operation. Some actions have a required order or a compatibility condition. Reliable scripts can handle repeated mechanics, while the agent decides whether the operation is appropriate.

I would label the material clearly. A historical incident describes what happened. A diagnostic guide suggests places to look. A required constraint states something the agent must respect. Putting all three in a folder called docs does not make their roles obvious.

**Skills should earn their place through what they contribute.** A skill can contain instructions, examples, reference material, or reusable code. The [Agent Skills specification](https://agentskills.io/specification) already separates a short description from the full instructions and supporting files, which can be loaded later.

A skill that forces thirty irrelevant checks can waste effort. A skill that supplies a reliable way to inspect a particular system can help. Those are different content choices within the same packaging format.

There are also two separate design decisions: what knowledge we provide, and when we load it. Removing unnecessary startup material does not require throwing away useful expertise. Moving a rigid checklist into another directory does not make it more flexible.

Research reinforces the need to test the particular intervention. [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) found that repository context files did not generally improve task success in its experiments. [SkillsBench](https://arxiv.org/abs/2602.12670) found substantial gains from curated skills on a different set of tasks. These studies are not a direct comparison of skills with a document corpus. They give us reason to measure what helps in our own environment.

**Simple search is a good place to start.** Clear filenames, a useful index, and text search can take an agent a long way. An index entry should explain when a document is useful, including the symptoms or terms that would lead someone to it.

There will still be vocabulary gaps. A user may say that requests randomly hang, while the relevant report describes connection exhaustion. The agent might bridge that gap by trying another query, following a link, or using a search tool that finds related meanings.

I would begin with the simplest approach that finds the right material reliably. If the agent keeps missing important documents, I would improve search based on those failures. The choice of search technology should remain open to evidence.

**The codebase analogy also needs the part that pushes back.** A coding agent can run a test and discover that its plausible change is wrong. A compiler can reject invalid code. That feedback is part of the environment we should try to reproduce.

For our slow application, a command completing successfully does not establish that the problem is fixed. The agent needs to check whether the change took effect, whether response times recovered, and whether another part of the system became unhealthy.

Reference material explains what may be relevant. Current observations establish what is happening now. Checks after an action establish whether it helped. A useful agent needs access to all three.

As the investigation grows, it also needs a brief working record: what it has checked, which explanations remain plausible, what it changed, and what is still unknown. That record should point back to the evidence. My earlier essay on [local context](https://oddly.fyi/writing/local-context-for-autonomous-agents/) explores how to keep large amounts of evidence available without loading it all into the conversation.

**I would evaluate this design through complete investigations.** Take realistic problems whose outcomes can be checked. Give different versions of the agent the same starting information and access. Compare which ones find the cause, take an appropriate action, and verify the result.

Change one part at a time. Load the same guidance upfront or only when needed. Compare a checklist with a worked example containing the same facts. Try a different search tool against the same collection of documents.

When the agent misses something, ask for its explanation, then test that explanation. Giving it the relevant document directly can help distinguish a discovery problem from a problem using the information. Repeat the comparison across several problems and runs before drawing a conclusion.

I would keep the documents, skills, and tools that improve those outcomes. I would remove the ones that create work without improving the result. And I would keep checking both choices as the model and the system change.
`
};
