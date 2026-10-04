# Rare Events Change the Meaning

*The same detector can produce very different evidence in a different population.*

A detector catches 80% of defects and falsely flags 2% of healthy tasks. Those two rates sound like properties of the detector. The chance that one of its alerts is real also depends on how often defects occur.

Consider two illustrative populations of ten thousand tasks. In the first, 10% contain defects. In the second, only 1% do. Assume, for this example, that recall and false-positive rate remain unchanged.

In the first population, the detector finds 800 defects and raises 180 false alarms. About 81.6% of its 980 alerts are real. In the second, it finds 80 defects and raises 198 false alarms. Only about 28.8% of its 278 alerts are real.

No detector parameter changed. The meaning of an alert changed because the denominator changed.

## A selected benchmark creates a selected answer

An evaluation set with equal numbers of healthy and defective tasks is useful for examining both kinds of case. It cannot, without adjustment and supporting assumptions, tell a review team how many production alerts will be real.

For a binary detector, the relationship is explicit:

```
precision = recall × prevalence
            / (recall × prevalence + false-positive rate × (1 − prevalence))
```

Prevalence is the share of cases that actually have the condition. This equation also explains why a small false-positive rate can create substantial work when the healthy population is large.

The assumption matters. Moving to a different population can change the kinds of defects and healthy cases the system encounters. Recall and false-positive rate may change too. Reweighting old results cannot rescue an evaluation whose examples no longer resemble the new setting.

## Sampling controls what can be discovered

Suppose a service handles 100,000 tasks a day, and a particular failure occurs in 0.1% of them. There are about 100 such failures. A uniform 1% sample contains only one on average.

If those 100 failures are independently sampled with probability 0.01, the probability of seeing none is 0.99 raised to the power 100, about 36.6%. An empty day's sample is entirely compatible with a continuing problem. These are illustrative assumptions, not a claim about any deployed service.

A stable hash sample can make repeated comparisons reproducible. It does not create more examples of a rare event. Targeted sampling can help investigate that event, but its selected cases must remain distinguishable from the natural sample used to estimate prevalence.

Sampling also has a unit. Taking turns, conversations, users, or incidents answers different questions. A user with many turns contributes more to a turn-weighted report than a user with one. The label “random sample” does not resolve that choice.

## Do not confuse predicted frequency with real frequency

A dashboard counts the labels the classifier produced. Those counts mix real prevalence with the classifier's errors. A rise in predicted defects can reflect more defects, more false alarms, or a change in the sampled population.

[Lipton, Wang, and Smola's work on label shift](https://proceedings.mlr.press/v80/lipton18a.html) studies estimating changed class frequencies using a predictor and a reference confusion matrix. Its key assumptions include unchanged inputs conditional on the class and an invertible confusion matrix. A new kind of failure can violate the first assumption precisely when the organization most wants an answer.

Use such corrections with their assumptions visible, and obtain fresh reference labels when the distinction matters. The practical habit is simpler than any estimator: whenever someone presents a rate, ask which population, which sampling process, and which errors stand between that number and the world.
