# Accuracy Hides a Question

*A metric becomes useful when its denominator matches the decision.*

Imagine ten thousand completed agent tasks. One hundred contain a serious defect. A classifier calls every task healthy and reports 99% accuracy.

It has found none of the defects.

The arithmetic is correct. Healthy tasks dominate the population, so recognizing them dominates the score. The question the team meant to ask—whether the detector finds serious failures—has disappeared inside another question.

## Keep the four counts visible

Declare defects the positive class. Suppose a detector finds 80 of the 100 defects and flags 198 healthy tasks. These numbers are illustrative.

```classifier-figure
{"type":"table","title":"The four counts behind the score","columns":["Actual condition","Flagged","Left alone"],"rows":[["Defective: 100","80 true positives","20 false negatives"],["Healthy: 9,900","198 false positives","9,702 true negatives"]],"compact":true}
```

- **Recall:** Of the 100 defects, we found 80. Recall is **80%**.
- **Precision:** Of the 278 alerts, 80 were real. Precision is **28.8%**.
- **False-positive rate:** Of 9,900 healthy tasks, 198 were flagged. The rate is **2%**.
- **Accuracy:** We got 80 + 9,702 answers right out of 10,000. Accuracy is **97.82%**.

This detector has lower accuracy than the always-healthy baseline, yet finds 80 failures that baseline misses. It also creates 198 unnecessary reviews. Which system is useful depends on what those discoveries and reviews are worth.

## Aggregation chooses what counts

An aggregate is a voting system. Before trusting the result, ask who gets a vote: each item, each category, each difficulty group, or each unit of business impact?

For several classes, three familiar F1 averages give different answers:

- **Macro-F1:** Calculate F1 for each class, then give each class an equal vote. A rare class matters as much as a common one.
- **Micro-F1:** Pool true-positive, false-positive, and false-negative counts before calculating F1. Frequent decisions dominate. For exhaustive single-label classification over all classes, this equals accuracy.
- **Support-weighted F1:** Average class F1 scores in proportion to their reference counts. Common classes get more weight; this is not weighting by difficulty.

These conventions are documented in the [scikit-learn evaluation guide](https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics). Report per-class results and support—the number of reference examples—alongside the average. A rare class with three examples can swing dramatically after one changed judgment.

### Can harder items count more?

Yes. Assign each item a nonnegative weight, multiply that weight by whether the answer was correct, and divide by the total weight. At least one weight must be positive.

```
weighted accuracy = sum of weights of correct items
                    / sum of weights of all items
```

This is ordinary sample weighting; [accuracy_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html) supports it directly. The arithmetic is easy. **The difficult part is deciding what the weights mean.**

Consider two classifiers on the same 120 support requests. Before evaluating them, reviewers separated 100 routine requests from 20 challenge cases containing interacting intents or negation. Each item receives one correct-or-incorrect judgment under a fixed rubric. Assume the references are reliable.

```classifier-figure
{"type":"table","title":"The winner changes when the votes change","columns":["Evaluation slice","Classifier A","Classifier B"],"rows":[["Routine: 100 items","98 correct → 98%","88 correct → 88%"],["Challenge: 20 items","4 correct → 20%","12 correct → 60%"],["Each item counts once","102/120 → 85.0%","100/120 → 83.3%"],["Each challenge item counts five times","118/200 → 59.0%","148/200 → 74.0%"]],"note":"Illustrative results. The factor of five is a declared evaluation choice, not a research-derived constant."}
```

For A, the weighted numerator is 98 + 5 × 4 = 118. The denominator is 100 + 5 × 20 = 200. B earns 88 + 5 × 12 = 148. A wins the ordinary score; B wins the weighted one.

Nothing about either classifier changed. We gave the routine and challenge groups equal total weight. That can be a useful capability test. It is not an estimate of production accuracy unless this weighting actually represents the target population.

### Complexity, difficulty, and importance are different

An item's **complexity** describes its structure: multiple intents, a reference to earlier context, or several evidence sources. Its **difficulty** describes how hard it is for a particular population of humans or systems to answer under specified conditions. Its **importance** describes the consequence of an error.

A long message with one clear request may be easy. A two-word reply—“not that”—may be hard without context. A trivial-to-detect disclosure can still be costly. And a case everyone gets wrong may have a bad reference label rather than unusually deep reasoning.

For an initial difficulty rubric, I would record separate features: number of interacting decisions, whether cross-message context is required, and whether the evidence is complete. Have independent reviewers apply that rubric. Check that the proposed groups correspond to meaningful differences across several baseline systems. Keep missing or contradictory evidence visible instead of automatically awarding it the largest weight.

A guessed “complexity score” from the classifier being evaluated is a poor default: it lets that system help choose the terms of its own exam.

## What research contributes

**Item Response Theory (IRT)** offers a more principled way to estimate difficulty from response patterns. It jointly models item properties and respondent ability. In a common two-parameter form, difficulty identifies the ability level at which success has 50% probability, while discrimination describes how sharply that probability changes with ability. These are fitted properties, not author-assigned stars.

[Lalor, Wu, and Yu (2016)](https://aclanthology.org/D16-1062/) used many human responses to build IRT evaluation scales for textual entailment and compare NLP systems with a human population. Their study shows why equal raw accuracy need not imply the same estimated ability. It also requires enough response data and checks that the fitted scale is appropriate.

[Maia Polo and colleagues' tinyBenchmarks (2024)](https://proceedings.mlr.press/v235/maia-polo24a.html) uses response information from LLMs, including IRT representations, to select compact evaluations and estimate full-benchmark performance. Its aim is efficient estimation of a benchmark score. It does not establish that hard questions should carry more business value.

IRT is therefore relevant when the aim is measuring capability or choosing informative test items. It is not equivalent to “multiply each answer by its difficulty.” A difficulty estimate is also tied to the fitted respondent population and model assumptions; validate its usefulness when the system family or task changes.

There is a simpler complementary approach: test named capabilities separately. [CheckList (Ribeiro and colleagues, 2020)](https://aclanthology.org/2020.acl-main.442/) organizes behavioral tests around capabilities and test types, exposing failures that an overall held-out score can miss. For an engineering team, a visible failure on negation may be more actionable than a small change in a complex composite score.

## A scorecard I would actually use

My recommendation is to keep three views:

1. **Performance under the real traffic mix.** Estimate ordinary quality and consequential errors on a representative sample, or use justified sampling weights. These weights answer “how common?”
2. **Capability by difficulty group.** Show routine and challenge results, counts, and uncertainty. An optional, clearly named composite can balance groups. These weights answer “what capability do we want to emphasize?”
3. **Expected impact of mistakes.** If error costs are defensible, evaluate them directly. Missing an attack and quarantining a legitimate ticket can have different costs even at the same difficulty. These costs answer “what happens when we are wrong?”

Freeze the rubric and weights using development evidence before comparing candidates on a held-out test. Show how rankings change under other reasonable weights. Report uncertainty using the actual sampling unit; twenty related messages from one incident are not twenty independent incidents. Very uneven weights can make a small number of examples dominate the result.

Finally, choose the decision threshold on validation data, then test the completed policy separately. The [threshold-tuning guide](https://scikit-learn.org/stable/modules/classification_threshold.html) explains this separation. For our defect detector, that means asking whether the team can review 278 alerts and tolerate 20 misses—not celebrating a percentage in isolation.

Difficulty-aware scoring can be useful. Its value comes from a defensible question, a stable rubric, and visible component results. A more elaborate average should explain the tradeoff better than the simple one it replaces.
