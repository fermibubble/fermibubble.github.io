# Measurement Needs a Memory

*A dashboard cannot explain change if the instrument forgets how it worked yesterday.*

A dashboard reports that unresolved tasks doubled overnight. The team starts searching for a product regression. Later, someone discovers that the classifier's definition of `UNRESOLVED` changed to include partial completion.

The dashboard faithfully counted its inputs. The comparison joined two different meanings under one familiar name.

Every classifier used over time is a measurement instrument. Its history belongs to the measurement. Without that history, changes in the instrument can masquerade as changes in the world.

## Version the behavior that reached production

A prompt file is only one part of a prompted classifier. Record the label definitions and hierarchy, the model identifier, rendered prompt or its reproducible fingerprint, input preparation, generation settings, response schema, parser, thresholds, and policy for empty or invalid results.

The input population also belongs in the record. A new traffic source or a different sampling rate can move the label distribution without changing the classifier. Provider-controlled model changes may not be fully observable, so retain the version information actually available and acknowledge what cannot be reconstructed.

Keep predictions linked to the relevant versions and input snapshots. A stored fingerprint detects a difference; it does not show that the new behavior is better. That requires comparison against evidence.

## Run the old and new instruments together

Before treating a revision as a continuation of the same time series, run both versions on a shared set of inputs. Inspect where their answers differ. Have consequential disagreements reviewed against the same rubric, or explicitly compare old and new rubrics when the meaning itself changed.

A prospective overlap can reveal effects that a frozen benchmark misses. It also creates an honest break in the time series when continuity cannot be supported. Retain a way to roll back the classifier or limit its influence while a change is understood.

When a live distribution shifts, examine the instrument first: definitions, model, parser, thresholds, failure rates, and sampling. Then investigate a change in the population or in the underlying behavior. This sequence avoids explaining a software change as a change in users.

## Make the scorecard reproducible

A useful release record is compact enough to read and specific enough to reproduce:

- The decision the classifier supports, the positive class, and the costs of errors.
- Versions of the classifier, label set, reference dataset, and sampling design.
- Reference-label provenance, important disagreements, and unresolved cases.
- Per-class counts, relevant metrics, baselines, and uncertainty intervals.
- Results across repeated runs, score calibration where used, and coverage under the chosen thresholds.
- Operational failures, known weak slices, and the conditions that should trigger reevaluation.

Use development data to improve the system and held-out data to assess the chosen revision. For uncertainty estimates, preserve the evaluation's sampling design and account for dependent observations, such as turns from the same conversation. A narrow interval calculated under false independence creates confidence without additional evidence.

The report should also state where evidence is too thin. “Four reference examples” is more useful than a precise percentage that invites a stronger conclusion than the data support.

## Keep contact with fresh evidence

Operational monitoring can track errors, empty outputs, catch-all categories, deferrals, and changes in label frequency. Those signals tell the team where to investigate. They do not, by themselves, measure semantic correctness.

Periodically obtain fresh reference labels, especially after consequential changes or drift signals. Set the cadence and sample size around traffic, decision cost, and observed instability. There is no universal schedule that makes an instrument trustworthy.

The collection began with an export labeled resolved even though its file was incomplete. A mature system can return to that judgment: recover its evidence, inspect the definition used, discover the missing completion check, and show that a revised classifier handles both that case and new ones better.

That ability to revise with evidence is the durable achievement. The labels become useful because the organization can explain what they mean, test where they fail, and remember when their meaning changes.
