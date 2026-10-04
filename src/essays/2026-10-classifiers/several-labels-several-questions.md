# Several Labels, Several Questions

*Finding some of the truth, finding all of it, and finding the cause are different achievements.*

An agent encounters a permission error, repeats the same unsuccessful operation, and eventually gives the user an incomplete answer. Three labels may describe the episode: `ACCESS_FAILURE`, `RETRY_LOOP`, and `INCOMPLETE_RESPONSE`.

A classifier finds the last two. How good is its answer?

If the purpose is to count poor responses, it may be useful. If the purpose is to fix the earliest failure, the missing access problem matters more than either correct label. A set of true statements can still leave the important question unanswered.

## Exactness and overlap

Multi-label classification allows several categories to apply to one input. The reference and prediction are therefore sets. Different comparisons reveal different failures.

In the illustrative episode, the reference has three labels and the prediction has two, both correct. Set precision is 2 / 2 = 1. Recall is 2 / 3. Jaccard similarity, the intersection divided by the union, is also 2 / 3. Sample F1 is twice the intersection divided by the combined set sizes: 4 / 5 = 0.8.

Exact-set accuracy gives this episode zero because the sets differ. That strict answer is appropriate when the entire result must be correct. It discards useful information when the question concerns partial diagnostic coverage.

Another measurement counts correct yes-or-no decisions across every possible label. With fifty possible labels and two true labels, a classifier that predicts none is correct on 48 of the 50 slots. Its Hamming accuracy is 96%, even though it finds nothing. The many absent labels overwhelm the two distinctions the reader cares about.

Neither metric is inherently fraudulent. Each answers a particular question. Put the empty-set baseline beside a slot-based score and the exact-set result beside a measure of overlap. Define what happens when both sets are empty; silently choosing a convention can move the aggregate result.

## Hierarchy introduces distance

Suppose `EXPIRED_CREDENTIAL` and `MISSING_ROLE` both belong under `ACCESS`. Predicting one sibling instead of the other may route an issue to the right team while recommending the wrong repair. Predicting `RESPONSE_STYLE` might fail at both.

Evaluate the level at which the decision is made. Report broad-group quality and leaf-level quality separately when both matter. Shared-ancestor credit can reveal a useful partial answer, but it should not conceal a harmful leaf-level confusion.

The hierarchy should be a maintained mapping with stable identifiers. Inferring parents from punctuation in display names makes a copy edit capable of breaking evaluation and routing. Version the relationships along with the label definitions.

## Co-occurrence does not establish causation

An early error is not automatically the cause of every later problem. Perhaps the agent recovered from the permission issue and later failed for an independent reason. To label a primary cause, define what evidence supports the causal claim and allow it to remain unresolved.

Do not infer primacy from whichever label appears first in an array, or from the largest unvalidated confidence number. If the product needs a primary cause, give it an explicit field, an evidence requirement, and its own evaluation.

The three questions can now be kept apart: Did the classifier find the relevant phenomena? Did it select the useful level of specificity? Did it support the proposed explanation for what happened?

A richer output makes these distinctions possible. It also creates more obligations for the evaluation. More labels should increase what the system can explain, not merely the number of ways it can appear partly right.
