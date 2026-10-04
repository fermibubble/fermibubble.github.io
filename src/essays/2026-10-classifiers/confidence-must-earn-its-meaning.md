# Confidence Must Earn Its Meaning

*Agreement, repeatability, and calibrated confidence answer different questions.*

A prompted classifier returns `INCOMPLETE_EXPORT` with confidence 0.97. The number looks like a probability. It may simply be another piece of text the model generated.

It can still be useful. What makes it useful is an observed relationship between that number and correctness on the relevant task. Decimal precision does not supply that relationship.

## Three kinds of reassurance

**Agreement** asks how closely the classifier matches reference judgments. Report the actual confusions as well as any summary statistic. Chance-corrected statistics such as Cohen's kappa account for agreement expected from the two label distributions, but their interpretation still depends on prevalence, sample size, and the task. A universal adjective such as “excellent” can conceal those conditions.

**Stability** asks whether repeated runs give the same answer for the same evidence. A stable classifier can be consistently wrong. An accurate average can hide individual episodes whose outcomes change between runs. Measure both.

**Calibration** asks whether reported probabilities correspond to observed frequencies. Among a sufficiently large group of predictions assigned roughly 0.8 confidence, roughly 80% should be correct if that confidence is well calibrated for the population and event being measured.

These are related properties, but none establishes the other two.

## Test the uncertainty you intend to use

For stability, repeat the same cases under the intended production settings and record the model and configuration. Bypass result caches, or distinguish cached repeats from fresh judgments. Low sampling temperature alone should not be treated as a guarantee of reproducibility across an entire serving system.

Define the statistic. For three answers `A, A, B`, two of the three run pairs disagree, so pairwise flip rate is 2 / 3. Two of the three runs match the mode. Calling both measurements “consistency” invites a mistaken comparison.

For calibration, retain the score and compare it with independently established correctness on held-out data. Group similar scores and inspect the fraction correct, together with the number of examples in each group. Small bins offer weak evidence. A good overall calibration result can also hide a weak class or language slice.

Suppose one hundred predictions all receive 0.95 confidence and only seventy are correct. That group is overconfident by 25 percentage points. A cutoff of 0.9 admits all one hundred; it does not turn their observed correctness into 90%.

[Guo and colleagues](https://proceedings.mlr.press/v70/guo17a.html) studied miscalibration in neural networks and showed that temperature scaling worked well in many of their experiments. That method rescales logits. A confidence number written into generated JSON is a different object; it does not acquire the paper's guarantee by sharing the word “temperature.” Score-based calibration methods also need appropriate held-out data, as described in the [scikit-learn calibration guide](https://scikit-learn.org/stable/modules/calibration.html).

## Give uncertainty somewhere to go

Abstention lets a classifier decline to make a sufficiently supported decision. It needs an explicit downstream response: gather evidence, ask a reviewer, or leave the case unresolved.

Report coverage—the share of inputs on which the system makes a decision—beside quality on those accepted decisions. A system that handles only the easiest 5% can report excellent accepted-case precision while offering little help. Inspect the deferred cases too; they may contain a disproportionate share of important failures.

Thresholds, calibration, and fallback policy belong in the evaluated system. Choose them using development or calibration data, then assess the finished policy on a separate test set. Persist enough information to reconstruct which candidates were accepted or deferred.

Confidence becomes operationally meaningful when the evidence tells us what actions a score can support. Until then, the number is a claim awaiting measurement.
