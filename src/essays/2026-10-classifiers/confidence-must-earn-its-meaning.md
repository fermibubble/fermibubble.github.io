# Confidence Must Earn Its Meaning

*Agreement, repeatability, and calibrated confidence answer different questions.*

An email classifier returns `PHISHING` with confidence 0.97.

Does that mean there is a 97% chance it is right? Not merely because the number has two decimal places. If an LLM wrote it into a response, it may be an untested estimate expressed as text.

To rely on the number, we need to observe how predictions with similar scores behave on independently judged cases. Confidence becomes useful through that relationship.

## Three kinds of reassurance

Keep these questions separate:

- **Agreement:** Does the classifier agree with a reference judgment?
- **Stability:** Does it return the same answer when we repeat the same case?
- **Calibration:** When it says 80% confidence, is it correct about 80% of the time on comparable cases?

A classifier can be stably wrong. Two reviewers can confidently share the same mistake. A calibrated system can still make too many errors for a demanding use case. None of these properties establishes the other two.

## Kappa: how much agreement is left after the baseline?

Suppose two reviewers independently label twenty emails as phishing or legitimate. Their judgments line up like this:

```classifier-figure
{"type":"table","title":"Twenty emails, two reviewers","columns":["Reviewer A ↓ / Reviewer B →","Phishing","Legitimate","A's total"],"rows":[["Phishing","8","2","10"],["Legitimate","2","8","10"],["B's total","10","10","20"]],"note":"The diagonal contains agreements: 8 + 8 = 16. The off-diagonal contains 4 disagreements. All counts are illustrative.","compact":true}
```

**Step 1: Count observed agreement.** They agree on 16 of 20 emails, so observed agreement, called pₒ, is **0.80**.

**Step 2: Calculate agreement expected from their label frequencies.** Each reviewer uses “phishing” half the time and “legitimate” half the time. If their labels were assigned independently with those same frequencies, they would both choose phishing with probability 0.5 × 0.5 and both choose legitimate with probability 0.5 × 0.5. Add them: expected agreement, pₑ, is **0.50**.

**Step 3: Express the improvement as a share of the improvement available.** They gained 0.80 − 0.50 = 0.30 beyond the baseline. The maximum possible gain was 1 − 0.50 = 0.50. Cohen's kappa is:

```
κ = (observed agreement − expected agreement)
    / (1 − expected agreement)

κ = (0.80 − 0.50) / (1 − 0.50) = 0.60
```

The interpretation is **60% of the possible improvement over this chance-agreement baseline**, not “60% accurate.” The [scikit-learn kappa reference](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html) gives the formula and the marginal-frequency construction. Kappa is 1 for perfect agreement, 0 when agreement equals that baseline, and negative when agreement is lower. If expected agreement is 1, the denominator is zero and kappa has no defined value.

### Why 90% agreement can produce kappa zero

Now use a different set: the reference identifies 2 phishing emails and 18 legitimate ones. A classifier labels all 20 legitimate.

```classifier-figure
{"type":"table","title":"The majority label can create reassuring agreement","columns":["Reference ↓ / Classifier →","Phishing","Legitimate"],"rows":[["Phishing","0","2"],["Legitimate","0","18"]],"note":"Observed agreement = 18/20 = 90%. Phishing recall = 0/2 = 0%.","compact":true}
```

The reference uses phishing 10% of the time; the classifier uses it 0% of the time. Expected agreement is (0.10 × 0) + (0.90 × 1) = **0.90**. Therefore κ = (0.90 − 0.90) / (1 − 0.90) = **0**.

That result exposes the weakness hidden by 90% raw agreement. It also shows why kappa depends on the label distributions. A change in prevalence can change kappa; do not interpret a shift without inspecting the counts.

Report the confusion table, raw agreement, class frequencies, and sample size with kappa. Twenty cases make the arithmetic easy to see, not the population estimate precise. With two reviewers, agreement does not prove either is correct. When one side is a vetted reference, ordinary precision and recall still tell us which mistakes matter. Avoid universal “good kappa” cutoffs. [Artstein and Poesio's methodological analysis](https://aclanthology.org/J08-4004/) examines how assumptions and task structure affect agreement measures.

For unordered labels such as phishing and legitimate, use unweighted kappa. Weighted kappa can represent degrees of disagreement for ordered ratings, such as low, medium, and high; it is not Chapter 6's item-difficulty weighting. For multi-label outputs, an explicitly defined per-label binary analysis or set-based evaluation is clearer than treating every label combination as an unrelated category.

## Test the uncertainty you intend to use

Start with the behavior you want to rely on. If repeated decisions must agree, test repeated decisions. If a score will trigger an action, test that score's relationship to correctness.

### If you need repeatability, rerun the same evidence

Freeze the input and configuration. Obtain fresh judgments rather than reading the same cached answer. Record the model version and production settings.

For three runs returning `A, A, B`, there are three pairs: first–second, first–third, and second–third. Two pairs disagree. The **pairwise flip rate is 2/3**. Meanwhile, two runs match the majority answer, so the **majority-match rate is also 2/3**. These happen to have the same number, but one counts disagreement and the other agreement. Always name the denominator.

Across many cases, report the chosen stability statistic and inspect the cases that flip. Check correctness separately: `A, A, A` has perfect stability even when the reference is `B`.

### If you need trustworthy probabilities, compare scores with outcomes

Here, define confidence as the claimed probability that the returned label is correct. On untouched evaluation cases, save each prediction and score, then compare with independent reference judgments. Group similar scores, count how many answers are correct, and keep the group sizes visible.

```classifier-figure
{"type":"steps","title":"A confidence claim meets a reality check","items":[{"title":"Claim","text":"100 predictions each report 0.95 confidence: the group implicitly claims about 95 correct answers."},{"title":"Observation","text":"Independent checking finds only 70 correct answers out of 100."},{"title":"Gap","text":"Observed correctness is 70%, which is 25 percentage points below the claimed 95%."},{"title":"Consequence","text":"A 0.90 acceptance threshold admits all 100. It does not turn their observed correctness into 90%."}],"note":"Illustrative calibration check. A top-label confidence and a probability of one named class are different quantities; define the event before testing either."}
```

Repeat this check across score ranges and important classes or languages. A group with five predictions provides weak evidence. A well-behaved average may conceal an overconfident subgroup.

If you fit a calibration method, use a separate calibration set and evaluate the resulting scores on untouched test data. [Guo and colleagues](https://proceedings.mlr.press/v70/guo17a.html) found temperature scaling effective in many neural-network experiments. It rescales logits; it does not automatically validate a confidence number generated in prose or JSON. The [calibration guide](https://scikit-learn.org/stable/modules/calibration.html) describes the role of held-out data.

## Give uncertainty somewhere to go

An uncertain answer needs a destination. In the email example, the policy might be:

- **Enough evidence for a label:** apply the action justified by that label and the policy.
- **A useful fact is missing:** make one permitted lookup, then reassess.
- **Still unresolved:** hold for a reviewer or leave explicitly unclassified, according to the workflow's stakes.
- **The system failed:** record a timeout or processing error and use the defined failure policy. Do not disguise it as a judgment of safety.

Abstention means declining to make a supported decision. It can improve the quality of automated decisions by moving uncertain cases elsewhere, but it also moves work.

```classifier-figure
{"type":"table","title":"Higher thresholds move work into the review queue","columns":["Accept at score ≥","Automated decisions / 100","Wrong among accepted","Deferred"],"rows":[["0.60","90 → 90% coverage","9/90 → 10% error","10"],["0.80","60 → 60% coverage","3/60 → 5% error","40"],["0.95","20 → 20% coverage","0/20 → 0% observed error","80"]],"note":"Illustrative results on the same 100 cases, with nested accepted sets. Zero observed errors among 20 cases is not a guarantee of zero future risk. Higher thresholds need not improve quality when scores rank cases poorly."}
```

**Coverage** is the share of all inputs decided automatically. **Selective error rate** is the fraction of accepted decisions that are wrong. Report them together. The last row looks flawless until we notice that four-fifths of the work remains unresolved.

If reviewers can handle only twenty cases a day, a policy deferring forty daily cases will build a backlog. Evaluate the deferred cases too: how many are important failures, how long do they wait, and how often does review get them right?

Choose thresholds and fallback behavior on development data, then test the complete policy on held-out cases. A confidence score earns operational meaning when evidence supports both the decisions it accepts and the route taken by those it declines.
