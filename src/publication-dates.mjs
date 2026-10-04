// Publication chronology shared by articles, archives, and feeds.
const publicationDates = {
  "classifiers-when-labels-become-decisions": "2026-10-04",
  "a-label-is-a-commitment": "2026-10-04",
  "categories-are-executable": "2026-10-04",
  "choose-the-evidence-before-the-model": "2026-10-04",
  "placement-changes-the-promise": "2026-10-04",
  "ground-truth-is-a-process": "2026-10-04",
  "accuracy-hides-a-question": "2026-10-04",
  "rare-events-change-the-meaning": "2026-10-04",
  "several-labels-several-questions": "2026-10-04",
  "confidence-must-earn-its-meaning": "2026-10-04",
  "measurement-needs-a-memory": "2026-10-04",
  "engineering-autonomous-agents": "2026-07-01",
  "verdicts-require-epistemics": "2026-07-11",
  "evidence-requires-provenance": "2026-07-26",
  "state-requires-ownership": "2026-07-31",
  "autonomy-requires-a-dial": "2026-08-10",
  "trustworthy-autonomy": "2026-08-15",
  "inputs-require-a-trust-boundary": "2026-08-19",
  "knowledge-requires-a-clock": "2026-08-29",
  "local-context-for-autonomous-agents": "2026-09-03",
  "delegation-requires-ceilings": "2026-09-08",
  "failure-requires-a-ladder": "2026-09-18",
  "learning-requires-outcomes": "2026-09-23",
  "checkpoint-replay-for-agent-evaluation": "2026-09-28",
  "the-world-an-agent-can-read": "2026-10-03",
  "how-intelligence-finds-its-way": "2026-10-03",
  "the-next-useful-question": "2026-10-03",
  "the-edge-of-an-example": "2026-10-03",
  "a-procedure-is-a-hypothesis": "2026-10-03",
  "the-freedom-to-try-again": "2026-10-03"
};

// Publication time for the five essays released together on October 3.
const publicationTimes = Object.fromEntries([
  "how-intelligence-finds-its-way",
  "the-world-an-agent-can-read",
  "the-next-useful-question",
  "the-edge-of-an-example",
  "a-procedure-is-a-hypothesis",
  "the-freedom-to-try-again",
].map((slug) => [slug, "2026-10-03T04:52:57Z"]));

// The classifier collection and its chapters form one October 4 release.
Object.assign(publicationTimes, Object.fromEntries(
  Object.entries(publicationDates)
    .filter(([, date]) => date === "2026-10-04")
    .map(([slug]) => [slug, "2026-10-04T08:11:05Z"])
));

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
});

export function withPublicationDate(item) {
  const date = publicationDates[item.slug];
  if (!date) throw new Error(`Missing publication date for ${item.slug}`);
  return { ...item, date, publishedAt: publicationTimes[item.slug] ?? `${date}T12:00:00Z`, displayDate: dateFormatter.format(new Date(`${date}T12:00:00Z`)) };
}

export const newestFirst = (a, b) => b.date.localeCompare(a.date);
