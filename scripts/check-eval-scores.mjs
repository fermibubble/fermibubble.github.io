import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateEvalScores } from "../src/eval-scores.js";

const near = (actual, expected) => assert(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
for (const fixRemedy of [false, true]) for (const preserveSource of [false, true]) for (const weighting of ["tasks", "checks"]) {
  const result = calculateEvalScores({ fixRemedy, preserveSource, weighting });
  near(result.correctness, weighting === "tasks" ? (fixRemedy ? 5 / 6 : 13 / 18) : (fixRemedy ? 7 / 9 : 6 / 9));
  assert.equal(result.completionCount, fixRemedy ? 2 : 1, "Preserving the CSV source must not fix its two failed correctness checks");
  assert.equal(result.authorityCount, preserveSource ? 3 : 2, "A correct checkout remedy must not erase the CSV write violation");
}

const page = await readFile(new URL("../dist/writing/how-to-write-and-score-an-agent-eval/build-the-score/index.html", import.meta.url), "utf8");
const nodes = new Map([...page.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
  textContent: "", checked: false, value: "", hidden: true,
  handlers: {}, addEventListener(type, handler) { this.handlers[type] = handler; }
}]));
const root = { querySelector: selector => {
  const node = nodes.get(selector.slice(1));
  assert(node, `Missing rendered control ${selector}`);
  return node;
} };
globalThis.document = { getElementById: id => id === "eval-score-explorer" ? root : null };
await import("../src/eval-scores.js?dom-check");
const node = id => nodes.get(`eval-${id}`);
const change = (id, property, value) => {
  node(id)[property] = value;
  node(id).handlers.change({ target: node(id) });
};
assert.equal(node("controls").hidden, false);
assert.equal(node("correctness").textContent, "72.2%");
assert.equal(node("completion").textContent, "33.3%");
assert.equal(node("authority").textContent, "66.7%");
change("fix-remedy", "checked", true);
assert.equal(node("correctness").textContent, "83.3%");
assert.equal(node("completion").textContent, "66.7%");
assert.match(node("gate").textContent, /failed/);
change("preserve-source", "checked", true);
assert.equal(node("authority").textContent, "100.0%");
assert.equal(node("completion").textContent, "66.7%");
assert.match(node("gate").textContent, /passed/);
change("weighting", "value", "checks");
assert.equal(node("correctness").textContent, "77.8%");
change("fix-remedy", "checked", false);
change("preserve-source", "checked", false);
assert.equal(node("correctness").textContent, "66.7%");
assert.equal(node("completion").textContent, "33.3%");
node('reset').handlers.click();
assert.equal(node('correctness').textContent, '72.2%');
assert.equal(node('authority').textContent, '66.7%');
assert(node('permalink').href.includes('remedy=0&preserve=0&weighting=tasks'));
delete globalThis.document;

assert(page.includes('id="eval-controls" hidden'), "Controls should remain hidden without JavaScript");
assert(page.includes('id="eval-correctness">72.2%</strong>'), "The initial scores must be readable without JavaScript");
assert(page.includes('<noscript>'));
assert(!/visualize:|library-file:|window\.openai|\[!CALLOUT\]/.test(page));
for (const slug of ["design-the-test", "build-the-score", "trust-the-result"]) {
  const html = await readFile(new URL(`../dist/writing/how-to-write-and-score-an-agent-eval/${slug}/index.html`, import.meta.url), "utf8");
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${id}"`), `Missing section ${id}`);
  assert(!/visualize:|library-file:|\[!CALLOUT\]/.test(html));
}
console.log("Validated eight scoring states, control updates, no-JavaScript values, and chapter links.");
