import { readFileSync } from 'node:fs';
const java = readFileSync(new URL('../examples/workbench/LegacyExamples.java', import.meta.url), 'utf8');
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const method = (start, end) => `<pre><code>${escape(java.slice(java.indexOf(start), java.indexOf(end)).trim())}</code></pre>`;
const runnable = '<p>The <a href="/assets/downloads/oddly-workbench.zip">workbench</a> includes the complete <code>LegacyExamples.java</code> program, imports, assertions, and a run command: <code>java LegacyExamples.java</code> with JDK 17 or later. The fragments below are extracted from that same tested source.</p>';
export const revisions = {
 '/anti-patterns/premature-optimization/': { title:'Premature Optimization', body:`
<p>An optimization is premature when its cost is justified by an assumption you have not tested. The problem is not caring about performance early. It is committing to a complicated design before knowing which constraint matters.</p>
<h2 id="measure-the-constraint">Measure the constraint</h2>
<p>Suppose checkout takes 900 ms at the 95th percentile. You can spend a week replacing a collection algorithm, but a trace might show that 700 ms is waiting for a remote service. First record the workload, percentile, throughput, error rate, and environment. Separate time spent executing from time spent waiting.</p>
<p>A monolith is not automatically faster in every useful sense, and a microservice is not automatically scalable. Network hops, serialization, queueing, deployment independence, and team ownership all affect the choice. Choose a boundary for a concrete requirement, then measure its cost.</p>
<h2 id="a-small-experiment">Make the experiment smaller than the commitment</h2>
<ol><li>State the target: for example, checkout p95 below 400 ms at the expected peak load.</li><li>Capture a representative baseline and identify a dominant contributor.</li><li>Change one thing and rerun the same workload, including warm-up and repeated trials.</li><li>Compare memory, correctness, tail latency, and operational cost as well as the headline speed.</li><li>Keep the simpler implementation if the improvement is immaterial.</li></ol>
<h2 id="when-early-work-is-necessary">When early work is necessary</h2>
<p>Hard memory limits, safety deadlines, and an unavoidable data volume can rule out a design before a full implementation exists. Estimate those constraints early. A capacity model or small prototype can answer the architectural question without turning every line of code into a performance project.</p>
<p>Keep the benchmark input and command with the change. A result without its workload is difficult to reproduce and easy to overgeneralize. The same discipline applies when <a href="/writing/quality-flywheel/make-the-winner-earn-release/">deciding whether an agent improvement deserves release</a>.</p>`},
 '/anti-patterns/code-smells/': { title:'Code Smells', body:`
<p>A code smell is a reason to investigate, not a proof that a design is wrong. Ask what change is becoming difficult, which invariant is obscure, and whether a smaller refactoring makes that behavior easier to verify.</p>
<h2 id="duplication">Extract the decision that actually varies</h2>
<p>Two methods that scan the same list for different conditions may share a predicate. Java collections expose streams; a <code>List</code> itself has no <code>filter</code> method. A potentially absent result belongs in <code>Optional&lt;Integer&gt;</code>, not an invented sentinel.</p>
${method('    static Optional<Integer> first', '    static boolean prime')}
<p>Call <code>first(List.of(1, 4, 6), x -&gt; x % 2 == 0)</code>. The result contains 4. For an all-odd list it is empty. A caller can choose an explicit fallback or handle absence; calling <code>get()</code> without checking merely moves the failure.</p>
<h2 id="size-and-cohesion">Large methods and long parameter lists</h2>
<p>Length is a clue, not a universal threshold. A long table of independent rules may be easier to inspect than a maze of tiny wrappers. Split a method when separate responsibilities have separate reasons to change. Group parameters when they form a meaningful value with shared validation, not merely to reduce the visible argument count.</p>
<p>For an address, a value object can enforce required fields and avoid swapping two same-typed arguments. A bag of unrelated options that bypasses those checks is not an improvement. There is no useful universal API limit derived from a memory-span experiment.</p>
<h2 id="state-and-ownership">State and ownership</h2>
<p>Global mutable state makes dependencies and test order harder to see. Prefer explicit ownership and pass the dependency that a calculation actually needs. A pure utility function or an immutable constant does not have the same problem as a process-wide mutable registry.</p>
<h2 id="inheritance">Inheritance and public contracts</h2>
<p>Extending a collection merely to reuse storage can expose operations your domain cannot support. Composition lets a domain object expose only its valid operations. Inheritance can still be appropriate when the subtype preserves the parent contract. Judge substitutability, not whether a class happens to contain getters or static methods.</p>
<h2 id="refactor-with-evidence">Refactor against observable behavior</h2>
<p>Before changing a suspected smell, name a concrete failure: duplicate rules drift, invalid states can be constructed, or a feature touches unrelated modules. Write a behavior check for that failure, make one refactoring, and retain the public contract. Abstraction has a cost too.</p>${runnable}`},
 '/anti-patterns/accidental-complexity/': { title:'Accidental Complexity', body:`
<p>Essential complexity comes from the problem you must solve. Accidental complexity comes from the representation, tools, or organization you chose. The distinction is contextual: a constraint that is unnecessary in one application may be essential in another.</p>
<h2 id="a-small-calculation">Make the calculation visible</h2>
<p>Take the first <code>k</code> prime numbers in a supplied list and sum their square roots. The list order matters; the example does not generate an unbounded sequence of primes. Here is a complete definition of the predicate and calculation:</p>
${method('    static boolean prime', '    static void blockingExample')}
<p>For <code>[1, 2, 4, 9, 5]</code> and <code>k = 2</code>, the result is <code>sqrt(2) + sqrt(5)</code>. Zero requests return zero; negative requests are rejected. If fewer than <code>k</code> primes exist, this contract sums those available. The division bound avoids overflow from calculating <code>d * d</code>.</p>
<h2 id="choose-for-clarity">Choose the clearest representation</h2>
<p>The pipeline separates selection, truncation, transformation, and aggregation. An ordinary loop can express the same contract well, especially when early exits or diagnostics matter. “Declarative” is not a guarantee of simplicity. Prefer the version whose order, edge cases, and costs are easiest for the next reader to check.</p>
<p>The earlier example used an invalid method reference. The tested version uses <code>Math::sqrt</code> and a defined integer primality predicate.</p>${runnable}`},
 '/anti-patterns/negative-caching/': { title:'Negative Caching', body:`
<p>Negative caching stores an absence or failure so the next request need not repeat the same work. It can be useful. The failure mode is treating every negative response as equally stable.</p>
<h2 id="absence-is-not-outage">Separate absence from an outage</h2>
<p>A missing product in a slowly changing catalogue may be worth caching briefly. A database timeout says nothing about whether the product exists. Reusing that timeout as “not found” converts a temporary dependency failure into a false statement about the data.</p>
<p><a href="https://www.rfc-editor.org/rfc/rfc9111.html#section-3">HTTP caching explicitly permits negative responses under its storage rules</a>. Whether a particular response may be stored and reused depends on status, cache directives, authorization, and the cache context. “Negative response” alone is not a prohibition.</p>
<h2 id="write-the-policy">Write the policy before the annotation</h2>
<table><thead><tr><th>Outcome</th><th>Example policy</th><th>Invalidation</th></tr></thead><tbody><tr><td>Confirmed absence</td><td>Short, explicit TTL if bounded staleness is acceptable</td><td>Evict on creation; otherwise expire</td></tr><tr><td>Timeout or dependency unavailable</td><td>Do not store as absence; use a distinct error and bounded retry/backoff</td><td>Retry under a separate failure policy</td></tr><tr><td>Authorization failure</td><td>Do not share across identities or scopes</td><td>Account for policy changes and credential scope</td></tr></tbody></table>
<p>These are design examples, not universal TTL settings. Pick a lifetime from the cost of stale absence and the dependency load you can tolerate. A framework cache annotation does not establish the right domain policy; inspect its key, exception, null, and invalidation behavior.</p>
<h2 id="test-recovery">Test recovery, not only cache hits</h2>
<p>Request a missing key, create it, then repeat the lookup. Verify that your invalidation or expiry makes it visible within the promised window. Separately inject a timeout and prove the next successful lookup is not suppressed. Returning a domain object instead of an HTTP wrapper is not enough if the cache still conflates these outcomes.</p>`},
 '/anti-patterns/sequential-coupling/': { title:'Sequential Coupling', body:`
<p>Sequential coupling appears when callers must know an undocumented order of operations: initialize, prepare, process, then finish. Some protocols genuinely require an order. The design question is whether invalid orderings are easy to express and hard to diagnose.</p>
<h2 id="own-the-sequence">Own the sequence</h2>
<p>If every caller repeats the same lifecycle, give one component responsibility for it. Distinguish a successful commit from cleanup that must happen even when processing fails.</p>
${method('    static void withCleanup', '    static boolean authorized')}
<p>This fragment guarantees that cleanup is attempted. It does not guarantee cleanup succeeds, make the operation transactional, or roll back partial external effects. If both operations can throw, preserve the original error or use <code>try</code>-with-resources for an <code>AutoCloseable</code> resource so suppressed exceptions remain inspectable.</p>
<h2 id="make-states-explicit">Make states explicit</h2>
<p>For a longer protocol, model states such as <code>new → prepared → committed</code> with a failure path. Reject a second commit or a commit after cancellation. A builder can make required preparation part of construction; a state machine can make allowed transitions visible.</p>
<p>Test failure between each pair of stages. In particular, “finish” should not mean both “commit successful output” and “release the connection.” Those operations have different preconditions. The same issue appears in <a href="/writing/trustworthy-autonomy/state-requires-ownership/">agent ownership and late writes</a>.</p>${runnable}`},
 '/anti-patterns/busy-waiting/': { title:'Busy Waiting, Polling, and Blocking', body:`
<p>A tight loop repeatedly checking a condition consumes execution time while it waits. That is busy waiting. A loop that calls <code>Thread.sleep</code> between checks is polling: it gives up execution during the sleep but trades wake-up delay against repeated checks.</p>
<h2 id="choose-the-wait">Choose the wait your protocol needs</h2>
<p>Spinning can be justified for very short waits in specialized low-level code. Polling can be appropriate when a remote system offers no notification mechanism. For producer–consumer work within a Java process, a <a href="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/BlockingQueue.html">BlockingQueue</a> gives explicit waiting and publication semantics.</p>
${method('    static void blockingExample', '    static void withCleanup')}
<p>The queue is bounded, so producers wait when it is full. The consumer blocks on <code>take()</code> when it is empty. The sentinel is outside the example’s valid domain and terminates this single consumer. Multiple consumers require an explicit shutdown policy; one sentinel is not enough for an arbitrary worker pool.</p>
<h2 id="cancellation-and-visibility">Cancellation and visibility are part of the example</h2>
<p>The consumer restores its interrupt status and exits if interrupted. The coordinating thread bounds its join and interrupts the consumer during cleanup. Queue operations establish the publication relationship needed to hand off values safely. A plain shared boolean is not a replacement for a specified memory-visibility protocol.</p>
<p>For remote polling, use a deadline, bounded backoff, and cancellation. Measure both request load and detection delay. Replacing a spin with sleep changes the tradeoff; it does not turn polling into event-driven delivery.</p>${runnable}`},
 '/anti-patterns/action-at-a-distance/': { title:'Action at a Distance', body:`
<p>Action at a distance makes local behavior depend on something difficult to discover elsewhere. A method changes a field, but a global callback, interceptor, or mutable registry changes what that action means.</p>
<h2 id="make-the-path-traceable">Make the path traceable</h2>
<p>Imagine a payment method that appears to save a record while an interceptor also sends a receipt. A developer retries the method after a timeout and sends two receipts. The problem is the hidden side effect and missing retry contract, not the mere presence of an interceptor.</p>
<p>Put consequential effects behind an explicit operation with an idempotency key. Record the triggering request and the resulting external operation. In a debugger, log, or trace, a reader should be able to follow the path from the caller to the effect.</p>
<h2 id="cross-cutting-behavior">Cross-cutting behavior can still be useful</h2>
<p>Instrumentation, transaction boundaries, and access checks often belong in shared middleware. Keep those rules declared, narrowly scoped, and testable. A trace span can make an interceptor more visible than a manually copied convention. A hidden rule with broad matching and no observability does the opposite.</p>
<h2 id="review-question">A practical review</h2>
<p>List the side effects a caller can trigger, where their configuration lives, and how retries behave. Disable or alter one policy in a test and verify the resulting behavior is understandable. If a local change unexpectedly affects unrelated callers, narrow ownership before adding another special case.</p>
<p>The earlier title typo and partial AspectJ fragment have been removed. This article describes the design problem without presenting an incomplete aspect as executable code.</p>`},
 '/anti-patterns/magic-strings/': { title:'Magic Strings and Hidden Bypasses', body:`
<p>A magic string is a literal whose meaning is hidden in a convention. Repeating an unexplained status value across modules creates a maintenance risk. A special value that skips authorization creates a much more serious problem: an undocumented bypass.</p>
<h2 id="name-the-domain">Name the domain concept</h2>
<p>For a finite set of states, an enum or validated value type can make invalid values harder to construct. For an external protocol, keep the wire value at the boundary and translate it into the domain representation. A named constant helps explain a value but does not enforce a valid transition by itself.</p>
<h2 id="no-secret-bypass">Do not hide test behavior in user input</h2>
<p>A payment function must not treat <code>"******"</code> as a signal to skip validation. In Java, <code>==</code> compares string references, so it was also the wrong test for content equality. Changing it to <code>equals</code> would fix that comparison while preserving the dangerous bypass.</p>
${method('    static boolean authorized', '    static void check')}
<p>This teaching fragment has no privileged magic value and handles null input. It is not a production authentication implementation: secrets, token verification, rate limits, and timing behavior belong to the appropriate authentication service.</p>
<h2 id="explicit-test-seams">Use an explicit test seam</h2>
<p>Inject a fake payment gateway in the test environment and assert that production construction uses the real gateway and authorization policy. Test the suspicious string as ordinary untrusted input. The important boundary is configuration and authority, not an obscure value a caller can guess.</p>${runnable}`}
};
