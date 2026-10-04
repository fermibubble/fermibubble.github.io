# Several Labels, Several Questions

*Finding some of the truth, finding all of it, and finding the cause are different achievements.*

An agent encounters a permission error, repeats the same unsuccessful operation, and gives the user an incomplete answer. Three labels describe the episode: `ACCESS_FAILURE`, `RETRY_LOOP`, and `INCOMPLETE_RESPONSE`.

A classifier finds the last two. How good is its answer?

For counting poor responses, it may be useful. For investigating the access problem, it misses something essential. We need to say which kind of correctness matters before calculating a score.

## Exactness and overlap

In multi-label classification, several categories can apply to one input. Compare the reference set with the predicted set.

For our three-label reference and two correct predictions:

- **Precision = 2/2 = 100%.** Every returned label belongs.
- **Recall = 2/3 = 66.7%.** One relevant label is missing.
- **Jaccard = 2/3 = 66.7%.** Two labels are shared out of three labels in either set.
- **Sample F1 = 2 × 2 / (2 + 3) = 80%.** This combines precision and recall.
- **Exact-set match = 0.** The prediction is not the complete correct set.

Another score counts correct yes-or-no decisions across every possible label. With fifty possible labels and three that apply, predicting none gets 47 absent labels right: **94% Hamming accuracy, with zero recall**. Always show that empty-set baseline beside a score dominated by absent labels.

Declare the convention for empty sets too. When both sets are empty, exact match is true, but several ratio formulas have zero denominators and require an explicit scoring convention.

## L1, L2, L3: how specific is the answer?

A hierarchy lets us describe the same issue at different depths. Consider a small support taxonomy. Each row is one path from a broad area to a specific issue.

```classifier-figure
{"type":"table","title":"One support taxonomy, three levels","columns":["L1 · Area","L2 · Issue family","L3 · Specific issue"],"rows":[["Account","Login","Locked account"],["Account","Login","Forgotten password"],["Payments","Refund","Card refund"],["Payments","Refund","Bank-transfer refund"]],"note":"L1 is broad enough for routing. L2 chooses a workflow. L3 selects the specific procedure. These are illustrative operational roles."}
```

If the true issue is **Locked account**, predicting **Account** finds the right area. Predicting **Login** narrows it further. Predicting **Forgotten password** chooses the right family but the wrong procedure.

Those answers should not all be described as simply correct or simply wrong. Broad routing and exact diagnosis are different achievements.

## Score each level at the decision it supports

Imagine a customer writes: “My account is locked, and I need a refund to my card.” Assume both facts are established in the reference.

- **Reference:** {Locked account, Card refund} — two L3 labels.
- **Prediction:** {Login, Card refund} — one L2 label and one L3 label.

The classifier chose a parent where it could not identify the specific login problem. To score L1, map each answer upward to its L1 ancestor. To score L2, map each sufficiently deep answer to L2. At L3, a parent-only prediction contributes no specific diagnosis; do not invent a child for it.

```classifier-figure
{"type":"table","title":"The same mixed-level answer, scored three ways","columns":["Level","Reference / prediction","Precision","Recall"],"rows":[["L1","Account + Payments / Account + Payments","100%","100%"],["L2","Login + Refund / Login + Refund","100%","100%"],["L3","Locked account + Card refund / Card refund","100%","50%"]],"note":"L1 F1 = 100%; L2 F1 = 100%; L3 F1 = 66.7%. Exact match of the required L3 set is zero. This is one worked case, not a population estimate."}
```

This is a useful routing answer and an incomplete diagnostic answer. The 100% L3 precision does not mean the diagnosis is complete: it says only that the one specific diagnosis returned is correct. L3 recall exposes the missing one.

For a dataset, report each level's precision, recall, F1, and support. Declare whether you pool counts across cases (micro), average category results (macro), or average per-case scores. Also report how often the system reaches the required depth. The ability to stop early should be visible, not rewarded as if a complete answer had arrived.

## Give partial credit without counting ancestors twice

A compact alternative is **hierarchical precision and recall**. Expand each set to include its ancestors, remove duplicates, and compare the expanded sets. Here we exclude the universal root, such as “All support issues,” because it adds no useful distinction.

```classifier-figure
{"type":"steps","title":"Work through the mixed-level example","items":[{"title":"Expand the reference → 6 distinct nodes","text":"Account, Login, Locked account, Payments, Refund, Card refund."},{"title":"Expand the prediction → 5 distinct nodes","text":"Account, Login, Payments, Refund, Card refund."},{"title":"Count the overlap → 5 nodes","text":"Everything predicted is supported. Locked account is the one missing node."},{"title":"Calculate the scores","text":"Hierarchical precision = 5/5 = 100%. Recall = 5/6 = 83.3%. F1 = 2×5/(5+6) = 90.9%."}],"note":"The high hierarchical F1 describes substantial partial overlap. It does not establish that the system can choose both specific procedures."}
```

For a single true path **Account → Login → Locked account**, compare three predictions:

```classifier-figure
{"type":"table","title":"A correct parent is useful, but incomplete","columns":["Prediction","Shared / predicted / reference nodes","Hierarchical F1","Exact L3 match"],"rows":[["Locked account","3 / 3 / 3","100%","Yes"],["Login only","2 / 2 / 3","80%","No"],["Forgotten password","2 / 3 / 3","66.7%","No"]],"note":"Formula: hierarchical F1 = 2 × shared nodes / (predicted nodes + reference nodes), after ancestor expansion and deduplication."}
```

Adding `Account` and `Login` explicitly beside `Locked account` must not earn extra credit: the expansion already contains them. For the exact set, canonicalize redundant ancestor labels first, so equivalent ways of writing the same answer are not penalized. Sibling labels remain distinct and may both be valid in a multi-label task.

Ancestor-based scoring is one established approach, not a universal definition of usefulness. [Kosmopoulos and colleagues](https://arxiv.org/abs/1306.6802) compare hierarchical measures and show that their choices can produce undesirable behavior, including sensitivity to hierarchy depth. This worked example uses a shallow tree with equal node weights. More irregular trees or graphs with multiple parents require an explicit, tested scoring convention.

## If one number is required

Prefer the separate level scores. If a product truly needs a composite, tie its weights to the decisions being supported and publish them.

For this example, suppose an illustrative policy gives L1, L2, and L3 F1 weights of 0.2, 0.3, and 0.5. The composite is 0.2 × 1 + 0.3 × 1 + 0.5 × 2/3 = **83.3%**. Those weights express a preference for specificity. They are not implied by the hierarchy or a research standard. The 83.3% also cannot authorize an exact repair when the required L3 label is missing.

Keep three boundaries explicit:

- **Reference depth:** If the reference itself says only `Login`, the true child may be unknown. Mark deeper evaluation as unassessed, restrict comparison to established depth, or obtain a more specific reference. Do not treat every unrecorded child as false. Report how many cases lack deep references.
- **Hierarchy version:** Store stable label identifiers and parent relationships. A renamed heading should not change the graph or the score.
- **Decision requirement:** A parent may be sufficient to route a ticket, while a specific action requires a supported leaf. State the required depth before evaluating.

## Co-occurrence does not establish causation

Return to the agent with an access failure, retry loop, and incomplete response. Even finding all three labels does not prove which event caused another. The agent might have recovered from the access problem and failed later for a separate reason.

If the product needs a primary cause, use a separate field, require supporting evidence, and evaluate that claim separately. Array order and the largest confidence number cannot establish causation.

A structured answer should therefore tell us three things: which phenomena were found, how specifically they were identified, and whether any proposed causal explanation is supported. More labels are useful when they make those distinctions clearer.
