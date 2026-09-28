// Publication chronology shared by articles, archives, and feeds.
const publicationDates = {
  "engineering-autonomous-agents": "2026-07-01",
  "context-vs-harness-engineering": "2026-07-06",
  "verdicts-require-epistemics": "2026-07-11",
  "what-does-good-mean-for-an-agent": "2026-07-16",
  "judgment-under-uncertainty": "2026-07-21",
  "evidence-requires-provenance": "2026-07-26",
  "state-requires-ownership": "2026-07-31",
  "skills-arent-policies": "2026-08-05",
  "autonomy-requires-a-dial": "2026-08-10",
  "trustworthy-autonomy": "2026-08-15",
  "inputs-require-a-trust-boundary": "2026-08-19",
  "memory-should-accumulate-judgment": "2026-08-24",
  "knowledge-requires-a-clock": "2026-08-29",
  "local-context-for-autonomous-agents": "2026-09-03",
  "delegation-requires-ceilings": "2026-09-08",
  "why-agent-verifiers-fail": "2026-09-13",
  "failure-requires-a-ladder": "2026-09-18",
  "learning-requires-outcomes": "2026-09-23",
  "checkpoint-replay-for-agent-evaluation": "2026-09-28"
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
});

export function withPublicationDate(item) {
  const date = publicationDates[item.slug];
  if (!date) throw new Error(`Missing publication date for ${item.slug}`);
  return { ...item, date, displayDate: dateFormatter.format(new Date(`${date}T12:00:00Z`)) };
}

export const newestFirst = (a, b) => b.date.localeCompare(a.date);
