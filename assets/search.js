// Pure ranking function shared by the dialog, results page, and regression checks.
const normalize = value => String(value || '').normalize('NFKC').toLowerCase();
const aliases = { rca: 'root cause', cas: 'compare and swap', rag: 'retrieval', evals: 'evaluation', llms: 'models' };
export function searchEntries(index, query) {
  const raw = normalize(query).trim();
  if (!raw) return [];
  const words = raw.split(/\s+/).map(word => aliases[word] || word);
  return index.map(entry => {
    const title = normalize(entry.title), description = normalize(entry.description);
    const fullText = [entry.text || '', ...(entry.sections || []).map(s => s.text)].join(' ');
    const body = normalize(fullText), headings = normalize((entry.sections || []).map(s => s.title).join(' '));
    const haystack = `${title} ${description} ${headings} ${body} ${normalize(entry.keywords)}`;
    if (!words.every(word => haystack.includes(word))) return null;
    const score = words.reduce((n, word) => n + (title.includes(word) ? 12 : 0) + (headings.includes(word) ? 7 : 0) + (description.includes(word) ? 4 : 0) + (body.includes(word) ? 1 : 0), 0) + (title.includes(raw) ? 15 : 0);
    const section = (entry.sections || []).find(s => words.every(w => normalize(`${s.title} ${s.text}`).includes(w)));
    const source = section?.text || fullText || entry.description;
    const at = Math.max(0, normalize(source).indexOf(words[0]) - 65);
    const snippet = `${at ? '…' : ''}${source.slice(at, at + 220)}${source.length > at + 220 ? '…' : ''}`;
    return { ...entry, score, snippet, sectionTitle: section?.title, href: section?.id ? `${entry.url}#${section.id}` : entry.url };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
