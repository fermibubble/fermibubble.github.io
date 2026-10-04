import { readFileSync } from "node:fs";
import { withPublicationDate } from "./publication-dates.mjs";

const directory = new URL("./essays/2026-10-classifiers/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", directory), "utf8"));
const collectionSlug = "classifiers-when-labels-become-decisions";

const examples = {
  "rare-events-change-the-meaning": {
    title: "The detector stays the same",
    caption: "Illustrative populations of 10,000 tasks. Recall stays at 80% and false-positive rate at 2%; only prevalence changes.",
    steps: [
      {
        label: "One in ten", headline: "Most alerts are real",
        facts: [["Actual defects", "1,000"], ["True / false alerts", "800 / 180"], ["Alert precision", "81.6%"]],
        observation: "The detector catches 800 of 1,000 defects and flags 180 of 9,000 healthy tasks.",
        implication: "There are 980 alerts, of which 800 describe real defects. Review effort is mostly spent on actual failures.",
        action: "Report the population's 10% prevalence alongside the 81.6% precision.",
        record: { tasks: 10000, prevalence: 0.1, true_positive: 800, false_negative: 200, false_positive: 180, true_negative: 8820, precision: "800 / 980" }
      },
      {
        label: "One in a hundred", headline: "Most alerts are false alarms",
        facts: [["Actual defects", "100"], ["True / false alerts", "80 / 198"], ["Alert precision", "28.8%"]],
        observation: "The same rates now find 80 of 100 defects and flag 198 of 9,900 healthy tasks.",
        implication: "The detector's recall and false-positive rate are unchanged. The much larger healthy population changes what an alert means.",
        action: "Plan review capacity around the actual population, and validate that the assumed rates hold there.",
        record: { tasks: 10000, prevalence: 0.01, true_positive: 80, false_negative: 20, false_positive: 198, true_negative: 9702, precision: "80 / 278" }
      },
      {
        label: "One in a thousand", headline: "A small error rate dominates",
        facts: [["Actual defects", "10"], ["Expected true / false alerts", "8 / 199.8"], ["Expected-count precision", "3.85%"]],
        observation: "At 0.1% prevalence, the expected counts are 8 true alerts and 199.8 false alerts. Fractional counts represent averages over repeated populations.",
        implication: "A low false-positive rate alone does not establish that individual alerts are reliable.",
        action: "Test whether an additional check, a different threshold, or a narrower use case improves the complete decision process.",
        record: { tasks: 10000, prevalence: 0.001, expected_true_positive: 8, expected_false_negative: 2, expected_false_positive: 199.8, expected_true_negative: 9790.2, precision_from_expected_counts: "8 / 207.8" }
      }
    ]
  },
  "several-labels-several-questions": {
    title: "One episode, three views of correctness",
    caption: "Illustrative reference labels: ACCESS_FAILURE, RETRY_LOOP, INCOMPLETE_RESPONSE. All fifty possible labels are equally weighted in the Hamming calculation.",
    steps: [
      {
        label: "Find two", headline: "Useful overlap, missing cause",
        facts: [["Predicted labels", "2 of 3"], ["Jaccard / sample F1", "0.667 / 0.800"], ["Exact set match", "No"]],
        observation: "The classifier finds RETRY_LOOP and INCOMPLETE_RESPONSE and adds no spurious labels.",
        implication: "Precision is 1 and recall is 2/3. Partial diagnostic coverage is good, but the access failure is still missing.",
        action: "Keep overlap quality separate from whether the evidence supports a primary cause.",
        record: { predicted: ["RETRY_LOOP", "INCOMPLETE_RESPONSE"], true_positive_labels: 2, false_positive_labels: 0, false_negative_labels: 1, sample_f1: "4 / 5" }
      },
      {
        label: "Find none", headline: "Many correct negatives, no discovery",
        facts: [["Predicted labels", "None"], ["Hamming accuracy", "94%"], ["Defect-label recall", "0%"]],
        observation: "An empty prediction gets the 47 absent labels right and misses all three reference labels.",
        implication: "A slot-based score looks high because most labels do not apply. It records no useful defect discovery.",
        action: "Include the empty-set baseline and a metric that exposes missed positive labels.",
        record: { possible_labels: 50, reference_labels: 3, predicted: [], hamming_accuracy: "47 / 50", recall: "0 / 3" }
      },
      {
        label: "Find all three", headline: "Membership still leaves a causal question",
        facts: [["Exact set match", "Yes"], ["Sample F1", "1.000"], ["Primary cause", "Requires evidence"]],
        observation: "The classifier now returns all three labels. Their membership matches the reference exactly.",
        implication: "Correct co-occurrence does not establish which event caused another or whether an intervention would prevent recurrence.",
        action: "Evaluate causal attribution separately when the product needs it, and permit an unresolved result.",
        record: { predicted: ["ACCESS_FAILURE", "RETRY_LOOP", "INCOMPLETE_RESPONSE"], exact_set_match: true, causal_attribution: "not established by set membership" }
      }
    ]
  }
};

export const classifierWriting = manifest
  .sort((a, b) => a.order - b.order)
  .map((item) => {
    const source = readFileSync(new URL(`${item.slug}.md`, directory), "utf8").trim();
    if (!source.startsWith(`# ${item.title}\n`)) throw new Error(`Essay title mismatch: ${item.slug}`);
    const body = source.replace(/^# [^\n]+\n+\*[^\n]+\*\n+/, "");
    const caseStudy = examples[item.slug];
    const exampleText = caseStudy ? [caseStudy.title, caseStudy.caption, ...caseStudy.steps.flatMap(step => [step.label, step.headline, ...step.facts.flat(), step.observation, step.implication, step.action])].join(" ") : "";
    const words = `${body} ${exampleText}`.trim().split(/\s+/).length;
    return withPublicationDate({ ...item, featured: false, seriesNumber: item.order, collectionSlug, summary: item.description, readTime: `${Math.ceil(words / 220)} min`, wordCount: words, body, ...(caseStudy ? { caseStudy } : {}) });
  });

export const classifierOverview = withPublicationDate({
  slug: collectionSlug,
  collectionSlug,
  title: "Classifiers: When Labels Become Decisions",
  titleLines: ["Classifiers", "When labels become decisions"],
  eyebrow: "Classification & measurement",
  featured: true,
  seriesOverview: true,
  readTime: "3 min",
  description: "Ten chapters on designing categories, choosing evidence, measuring errors, and deciding when a label deserves to influence what happens next.",
  body: `
A classifier turns an untidy situation into a small number of names. That compression makes a support queue sortable, an incident searchable, or an agent's behavior measurable. It also gives downstream systems something they may trust more than they should.

Imagine an assistant that returns an incomplete export. Its tools report success, its response sounds finished, and a classifier labels the task resolved. The label enters a dashboard and removes the episode from a review queue. Nothing in the machinery breaks. The user's task remains incomplete.

The challenge is larger than selecting a model. Someone has to decide what resolved means, which evidence establishes it, when the decision must arrive, and how to discover that the classifier is wrong. Those choices determine whether a label becomes useful knowledge or a repeatable mistake.

## The instrument behind the number

These chapters treat a classifier as a measurement instrument embedded in a decision process. A rule, a trained model, a prompt, and an investigating agent can all produce categories. Each needs a defined question, a source of evidence, and a way to test its answer.

The collection moves from design to measurement and then to change over time. It connects label definitions with software contracts, ground truth with provenance, confidence with evidence, and dashboards with the history of the instruments that produced them.

The examples are illustrative. Their numbers are chosen to make the reasoning inspectable: a detector with 99% accuracy that finds no failures, an unchanged detector whose alerts become less reliable, and a multi-label answer that is partly correct while missing the decisive cause.
`,
  afterword: `
## A path through the ideas

Start with the first four chapters when building or changing a classifier. They establish the contract, category boundaries, decision rule, and placement. Chapters five through nine examine reference labels, metrics, prevalence, structured outputs, and uncertainty. The final chapter brings them together in a reproducible release and monitoring process.

For a shorter route, read [A Label Is a Commitment](/writing/classifiers-when-labels-become-decisions/a-label-is-a-commitment/), [Accuracy Hides a Question](/writing/classifiers-when-labels-become-decisions/accuracy-hides-a-question/), and [Measurement Needs a Memory](/writing/classifiers-when-labels-become-decisions/measurement-needs-a-memory/). They frame the central responsibility: a label should retain a defensible relationship to the evidence and decision it represents.

## Connections and further reading

Oddly's [Evidence requires Provenance](/writing/trustworthy-autonomy/evidence-requires-provenance/) follows a number back to its denominator and source. [The Next Useful Question](/writing/how-intelligence-finds-its-way/the-next-useful-question/) examines when additional evidence is worth obtaining. [Checkpoint Replay for Long-Horizon Agent Evaluation](/writing/checkpoint-replay-for-agent-evaluation/) explores evaluation at the moment a decision was made.

Public technical references are linked in the relevant chapters: the [scikit-learn evaluation guide](https://scikit-learn.org/stable/modules/model_evaluation.html), [SetFit](https://arxiv.org/abs/2209.11055), [On Calibration of Modern Neural Networks](https://proceedings.mlr.press/v70/guo17a.html), and [Detecting and Correcting for Label Shift with Black Box Predictors](https://proceedings.mlr.press/v80/lipton18a.html).
`
});
