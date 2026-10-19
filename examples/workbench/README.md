# Oddly engineering workbench

These are standard-library teaching fixtures. The data is explicitly constructed;
there are no language-model calls, private incidents, or production performance claims.

## Reproduce

Use Python 3.10+ and JDK 17+ from this extracted directory:

```sh
python -m unittest -v
python workbench.py
java LegacyExamples.java
```

The Python suite has 21 boundary checks. The Java source-file launcher compiles
and runs assertions for optionals, prime calculation, queue termination, cleanup
on failure, and authorization without a magic bypass. No external services are used.

`report.json` is the expected Python report. `paired-outcomes.csv` is the complete
100-task illustrative release dataset: 72 both pass, 8 regressions, 14 improvements,
6 both fail. The seeded 10,000-draw paired percentile bootstrap gives a 6 percentage
point change with a [-3, 15] point interval. That interval includes zero; it does
not establish an improvement. Repeated observations of the same task must be
aggregated or resampled as clusters, not treated as independent rows.

`adapter-cases.json` is the complete four-transcript experiment. Raw output retains
all required diagnostics. An errors-only adapter loses warning evidence. Keeping
errors and warnings retains these fixture requirements with fewer UTF-8 bytes.
Byte counts are not model tokens, latency, cost, or downstream task success. The
oracle is deliberately visible and the sample is tiny; add unseen diagnostic types
before using this adapter. A successful build may still have semantic defects.

`checkpoint` gates both event time and availability time, requiring timezone-aware
timestamps. It does not simulate what a different action would have caused.
`commit_owned` demonstrates a single-threaded check. Real distributed ownership
requires an atomic compare-and-swap transaction and a defined cancellation protocol.
`evidence_complete` separates a completed export from complete requested coverage.

Classifier helpers preserve undefined denominators as null, reject unknown labels,
exclude the common root from hierarchy credit, and expose empty calibration bins.
They do not fit a classifier, calibrate a model, or choose a safe deployment threshold.

## Extend one assumption

- Replace paired outcomes with your held-out task results; retain task IDs.
- Add late evidence to replay and prove it remains invisible before availability.
- Cancel a task and attempt a stale result commit.
- Add a diagnostic with a new prefix and see the narrow adapter fail.
- Change prevalence while holding recall/FPR fixed; then question that stability assumption.
- Supply an explicit taxonomy and review whether ancestor credit matches your decision.

Source: https://github.com/fermibubble/fermibubble.github.io/tree/master/examples/workbench

## Actual compiler experiment

Run `python compiler_experiment.py` with JDK 17+ to compile and execute three
programs, repeated three times each. `compiler-results.json` records the original
OpenJDK 17.0.20 run, raw diagnostics, byte counts, and exit codes. The unchecked-cast
program compiled successfully with a 216-byte warning and then failed at runtime
in all three trials. The errors-only view discarded the warning. This is an
actual compiler/runtime observation on constructed programs, not an LLM benchmark,
a latency benchmark, or a population estimate. Diagnostic wording and byte counts
can vary with JDK version. An errors-plus-warnings adapter must retain complete
diagnostic blocks; a prefix filter can still lose detail or unfamiliar diagnostics.
