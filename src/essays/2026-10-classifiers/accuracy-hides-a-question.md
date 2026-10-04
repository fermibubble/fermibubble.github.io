# Accuracy Hides a Question

*A metric becomes useful when its denominator matches the decision.*

Imagine ten thousand completed agent tasks. One hundred contain a serious defect. A classifier calls every task healthy and reports 99% accuracy.

It has found none of the defects.

The arithmetic is correct. Accuracy counts correct answers across the full population. When healthy tasks dominate, recognizing them dominates the score. The question a team meant to ask—whether the detector finds serious failures—has disappeared inside another question.

## Keep the four counts visible

For a defect detector, declare defects the positive class. A true positive is a defect correctly flagged. A false negative is a missed defect. A false positive is a healthy task wrongly flagged. A true negative is a healthy task correctly left alone.

Now suppose another classifier finds 80 of the 100 defects and flags 198 of the 9,900 healthy tasks. These numbers are illustrative.

- **Recall** is 80 / 100 = **80%**. It answers how many actual defects were found.
- **Precision** is 80 / 278, approximately **28.8%**. It answers how many flagged tasks really contain a defect.
- **False-positive rate** is 198 / 9,900 = **2%**. It answers how often a healthy task was flagged.
- **Accuracy** is 9,782 / 10,000 = **97.82%**. It is lower than the always-healthy baseline.

These measurements are standard views of a confusion matrix; the [scikit-learn evaluation guide](https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics) documents their definitions and averaging conventions.

The second classifier catches failures the baseline ignores. It also creates review work. Whether that trade is worthwhile depends on the cost of a miss, the cost of a false alarm, and what happens after an alert. Neither the 99% nor the 80% settles the decision alone.

## Aggregation chooses what counts

For a system with several classes, per-class results reveal distinctions a single score can hide. Macro averaging gives each class equal weight. Micro averaging pools the counts. In exhaustive single-label classification, micro-F1 equals accuracy; changing the metric's name has not changed which cases dominate.

Macro-F1 can surface failures on rare categories, but a rare category with three examples still has a noisy score. Report support—the number of reference examples for each class—alongside the result. A zero denominator should have a declared treatment rather than silently becoming evidence of excellent performance.

F1 combines precision and recall. It does not encode every application's error costs or review capacity. A useful detector can have a modest F1 on rare events, and a high F1 can conceal an unacceptable miss on a particularly consequential class.

## Choose the operating point before celebrating

The model may produce scores that can be thresholded in different ways. Lowering a threshold often increases recall while increasing the volume of false alarms. Choose an operating point using development or validation data and an explicit objective, then test it on held-out cases. The [scikit-learn threshold guide](https://scikit-learn.org/stable/modules/classification_threshold.html) separates statistical prediction from the decision made with it and warns against tuning on the training data.

For the example above, I would ask whether a review team can inspect 278 flagged tasks, whether missing 20 defects is acceptable, and how the result compares with a simple existing rule. Then I would check uncertainty around the counts and performance on the important slices.

The useful scorecard keeps the decision attached to the numbers: the positive class, the population, the baseline, the threshold, the four counts, and the uncertainty. A metric should make the tradeoff inspectable before it makes the system look impressive.
