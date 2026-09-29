// Publication chronology shared by articles, archives, and feeds.
const publicationDates = {
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
