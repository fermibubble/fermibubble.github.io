# Choose the Evidence Before the Model

*The right decision rule depends on what must be learned before a label can be justified.*

An email says: “Your account closes tonight. Sign in here to keep it.”

Is it phishing? The wording is suggestive. The sender, link destination, and account history may tell a different story. A more elaborate classifier is useful only if it makes better use of relevant evidence or obtains evidence the simpler one lacks.

Let's hold the task fixed—classify this email—and change how the answer is produced. All implementations below are illustrative designs, not tested products.

## Four ways to reach an answer

### 1. Explicit rules: a person writes the conditions

A mail gateway extracts the link's domain and checks it against a maintained list of confirmed malicious domains. A match produces `PHISHING`. No match means “this rule did not decide,” not “the email is safe.”

**Technologies:** string and URL parsing, a database lookup, regular expressions for bounded patterns, or a policy engine. The decision boundary is written by people. There is no task-specific model training.

Rules are useful when the required distinction is precise and the evidence is available. A confirmed domain match is different from a loose rule saying every message containing “urgent” is malicious. The latter would also catch the concert ticket from Chapter 1. Rules miss cases outside their conditions; their apparent simplicity does not make the conditions correct.

### 2. Trained classifiers: examples teach the boundary

Collect labeled phishing and legitimate emails. Convert their text into features, fit a classifier, and test it on separate messages. One concrete baseline is TF-IDF text features plus logistic regression in scikit-learn. A more elaborate candidate could fine-tune a pretrained text encoder on the same task.

**Technologies:** a text vectorizer and classification model, or an encoder with a classification head. Training changes model parameters using examples. At prediction time, it applies what it learned to the supplied input. The [scikit-learn text-learning guide](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction) explains the feature representation; [SetFit](https://arxiv.org/abs/2209.11055) studies a few-shot approach built around sentence transformers.

This design can learn combinations that are awkward to enumerate as rules. It can also learn shortcuts: perhaps most attacks in the training set happened to mention one brand. Good held-out performance on that brand would not establish performance on a new campaign.

### 3. Prompted classifiers: instructions define today's task

Give a general language model the email, definitions of `PHISHING`, `LEGITIMATE`, and `INSUFFICIENT_EVIDENCE`, and a few boundary examples. Ask for a label and the specific evidence supporting it, then validate the returned structure.

**Technologies:** an LLM inference endpoint, a versioned prompt, and schema validation. In this design, changing the examples or definitions changes the request; it does not fit task-specific model parameters. The underlying LLM was, of course, trained earlier.

A prompt can tell the model that quoting a phishing email is different from sending one. But if it sees only the message body, it cannot establish who owns the destination domain. An explanation that sounds informed is still limited by the evidence supplied.

### 4. Agentic classifiers: the system investigates before deciding

The first pass cannot resolve the sender. A workflow queries an approved threat feed and an internal sender directory, retrieves the relevant results, and then chooses a label. If the lookups fail or remain inconclusive, it returns `INSUFFICIENT_EVIDENCE`.

**Technologies:** a tool-calling model or workflow controller, retrieval or database APIs, bounded tool permissions, and a final label validator. The defining difference is the additional evidence-gathering step. Repeating the same prompt three times is not the same as obtaining a new observation.

The extra evidence may justify a better answer. It also introduces lookup failures, stale sources, expense, and delay. An agent must earn its complexity through the decisions it improves.

```classifier-figure
{"type":"table","title":"What actually changes between the four?","columns":["Design","Where the decision comes from","How it improves"],"rows":[["Rules","Conditions written by people","Repair the conditions or the lookup data"],["Trained","Patterns fitted from labeled examples","Improve data, features, or training"],["Prompted","Definitions and examples supplied to an LLM","Improve instructions, context, or model choice"],["Agentic","A decision after gathering more evidence","Improve the investigation and the final judgment"]],"note":"These patterns can be combined. A tool lookup can itself use rules, and an agent can call a trained classifier."}
```

## Buy more evidence only when it helps

Treat an extra lookup like a question with a price. Before asking it, name the uncertainty it could resolve and the action that might change.

```classifier-figure
{"type":"steps","title":"Should this email trigger another lookup?","items":[{"title":"Name the missing fact","text":"We cannot tell whether the destination is a known credential-stealing site."},{"title":"Identify an available observation","text":"An approved threat service may have a current record for that domain."},{"title":"Ask whether the answer changes the route","text":"A confirmed match would justify quarantine under our policy; an inconclusive result would go to review."},{"title":"Bound the investigation","text":"Make the permitted lookup within the time budget. If it cannot resolve the question, preserve the uncertainty and use the fallback."}],"note":"If both possible lookup results lead to exactly the same action, this lookup has no immediate decision value. It might still be useful for a separately defined audit."}
```

A known malicious-domain match may already settle this policy's decision. More reasoning adds little. An unknown sender may warrant investigation. A missing fact with no accessible source may require a person, not an endless reasoning loop.

On validation cases, compare the decisions before and after the lookup. Count corrected mistakes, newly introduced mistakes, lookup failures, added latency, and cost. More evidence is worthwhile when that measured improvement justifies the resources and delay.

## Evaluate the whole route

Suppose a hybrid handles 1,000 incoming emails. Rules decide the obvious cases, a model handles some of the remainder, and people receive unresolved cases. Independent review later establishes the following illustrative results.

```classifier-figure
{"type":"table","title":"Follow all 1,000 emails to an outcome","columns":["Route","Emails decided","Correct","Wrong"],"rows":[["Rules","600","594","6"],["Model after rules","300","270","30"],["Deferred to people","100","Not yet assessed","Not yet assessed"],["Automated total","900","864","36"]],"note":"Automated coverage: 900/1,000 = 90%. Accuracy on automated decisions: 864/900 = 96%. End-to-end accuracy remains unknown until deferred outcomes are assessed.","compact":true}
```

Reporting “96% accurate” alone hides the 100 emails still waiting. Reporting only the rule's 99% hides the model's harder workload. And testing the model on random emails does not tell us its quality on the selected cases that survive the rules.

Evaluate each stage on the inputs it actually receives. Then evaluate the complete route on the same held-out population, including deferrals, timeouts, final outcomes, cost, and time to resolution. For phishing detection, also separate missed attacks from legitimate messages wrongly blocked; accuracy alone cannot describe that trade.

The useful comparison is not “Which architecture sounds strongest?” It is **“Which complete route reaches justified decisions, on enough of our traffic, within our constraints?”**
