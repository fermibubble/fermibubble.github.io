import assert from "node:assert/strict";
import { analyticsReady, trackingAllowed, cleanUrl, safePageQuery, scrubEvent } from "../src/analytics-policy.js";
import { analyticsConfig } from "../src/analytics-config.mjs";

// Consent and configuration failures must fail closed.
for (const choice of ["unknown", "declined", null, "", "accepted"]) {
  for (const signal of [true, false]) {
    for (const configured of [true, false]) {
      for (const production of [true, false]) {
        assert.equal(trackingAllowed(choice, signal, configured, production),
          choice === "accepted" && !signal && configured && production);
      }
    }
  }
}
const valid = { enabled: true, projectToken: "phc_test123", apiHost: "https://us.i.posthog.com", uiHost: "https://us.posthog.com" };
assert.equal(analyticsReady(valid), true);
assert.equal(analyticsReady({ ...valid, projectToken: "phx_privateKey" }), false);
assert.equal(analyticsReady({ ...valid, apiHost: "https://unrelated.example" }), false);
assert.equal(analyticsReady({ ...valid, uiHost: "https://eu.posthog.com" }), false);
assert.equal(analyticsReady({ ...valid, enabled: false }), false);
if (analyticsConfig.enabled) assert.equal(analyticsReady(analyticsConfig), true, "Enabled tracking needs a valid public token and matching region");

assert.equal(safePageQuery(""), true);
assert.equal(safePageQuery("?utm_source=newsletter&utm_campaign=september-2026"), true);
assert.equal(safePageQuery("?q=private+search"), false);
assert.equal(safePageQuery("?token=secret"), false);
assert.equal(safePageQuery("?utm_source=reader%40example.com"), false);
assert.equal(cleanUrl("https://example.com/a?token=secret#private"), "https://example.com/a");
assert.equal(cleanUrl("mailto:reader@example.com"), "");
assert.deepEqual(scrubEvent({ event: "$pageview", properties: {
  $current_url: "https://oddly.fyi/writing/?token=secret#private",
  $set_once: { $initial_referrer: "https://example.com/?q=private" },
  page_path: "/writing/", $ip: "192.0.2.1",
} }), { event: "$pageview", properties: {
  $current_url: "https://oddly.fyi/writing/", $set_once: { $initial_referrer: "https://example.com/" },
  page_path: "/writing/", $ip: "192.0.2.1",
} });
console.log("Validated consent boundaries, project configuration, and URL sanitization.");
