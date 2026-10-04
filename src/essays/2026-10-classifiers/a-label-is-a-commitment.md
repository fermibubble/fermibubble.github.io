# A Label Is a Commitment

*A category becomes consequential when another system starts acting on it.*

Your concert starts in an hour. The ticket email has disappeared.

An email filter saw “Act now,” a link, and an unfamiliar sender. It labeled the message `SUSPICIOUS`. Another part of the system moved it out of your inbox. The filter never said “make this person miss a concert.” A small label nevertheless helped that happen.

Now reverse the mistake. A fake password-reset email reaches your inbox because its polished wording looks ordinary. This time, a label helped an attacker reach you.

Both examples are illustrative. They make the central problem concrete: a classifier turns messy evidence into a category, and someone uses that category to decide what happens next. To design one well, follow the label all the way to that decision.

## Four choices inside one word

Imagine building this email filter. Four choices need separate answers:

- **The label set:** What does `SUSPICIOUS` mean? Evidence of phishing, unwanted advertising, or simply something unfamiliar? Those are different categories.
- **The decision rule:** Do we use a list of known malicious domains, learn patterns from labeled emails, ask a language model, or investigate the sender?
- **The placement:** Does the check finish before delivery, after delivery, or during a later audit?
- **The measurement:** How many attacks does it catch, and how many legitimate messages does it hide?

A better model cannot repair a definition that puts ticket confirmations and credential theft in the same bucket. Nor can a correct phishing label protect someone if it arrives after they have clicked.

## Decide what may follow

Write the action beside the label. The same `SUSPICIOUS` prediction can lead to three very different experiences.

```classifier-figure
{"type":"cards","title":"One label, different consequences","items":[{"title":"Show a warning","text":"The email stays visible. The reader gets a caution and can inspect it."},{"title":"Move to quarantine","text":"The email is held in a recoverable folder. The reader may miss something time-sensitive."},{"title":"Reject delivery","text":"The message never reaches the inbox. A mistaken rejection can be difficult to discover."},{"title":"Select for review","text":"A reviewer examines the message. The label chooses what gets attention, without deciding delivery by itself."}],"note":"These are possible policies, not recommendations for every email system."}
```

Suppose the only evidence is an unfamiliar sender. That may justify a closer look. It is weak support for permanently rejecting a concert ticket. Suppose instead that a trusted, current threat source identifies the destination as a credential-stealing site. That is a different basis for action.

The classifier's job is to describe what the evidence supports. The policy's job is to choose the response. Keeping those jobs visible lets a team change “quarantine” to “warn” without secretly changing what `SUSPICIOUS` means.

A practical test is simple: **if this label is wrong, what happens to the person?** A mistaken item in a review queue costs attention. A hidden ticket costs an evening. The acceptable error rate depends on the action.

## Ask what disappeared

The word `SUSPICIOUS` leaves out almost everything about the email. It does not tell us which signal triggered it, whether important evidence was missing, or which definition was used.

Think of the label as the headline and the supporting record as its receipt.

```classifier-figure
{"type":"table","title":"Keep a receipt for the judgment","columns":["Bare result","Inspectable result"],"rows":[["SUSPICIOUS","SUSPICIOUS under rubric v3"],["Reason unknown","Unfamiliar sender plus urgent wording; no confirmed malicious destination"],["Evidence unavailable","Link to the retained message snapshot and the signals inspected"],["Action unclear","Moved to quarantine; available for release"]],"note":"Illustrative ticket-email record. Retain evidence according to the system's access and retention rules."}
```

With only the bare result, a reviewer can disagree but cannot diagnose the mistake. With the receipt, the problem becomes visible: the filter treated unfamiliarity and urgency as stronger evidence than they deserved. The team can test a better rule against both real tickets and real attacks.

This does not require copying the whole inbox into every result. A reference to the relevant evidence, the definition version, and any unresolved question can be enough.

Before improving the model, complete one sentence for every important label: **“When this label appears, we will ___, because the evidence shows ___.”** If the second blank cannot justify the first, the classifier's contract needs work.
