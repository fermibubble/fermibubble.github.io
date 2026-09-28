# Oddly analytics

Connected to the **Oddly** project (633371, US region). The public project token is in `src/analytics-config.mjs`; the site loads analytics only after reader consent.

Private dashboard: https://us.posthog.com/project/633371/dashboard/2144998

Replay and heatmaps are enabled for oddly.fyi, with 100% of eligible consenting sessions selected and the existing 30-day recording retention. IP retention is enabled. No visitor data or private API credentials are published in this repository.

## Connection and maintenance

1. Select or create the owner's Oddly project through the authenticated PostHog connection.
2. Copy its **public project token** and correct US/EU ingestion and app hosts into `src/analytics-config.mjs`. Never use a personal API key in website code.
3. Confirm session replay is enabled in that project. Use the project's sampling and retention settings; the site does not override them or upgrade billing.
4. Verify GeoIP enrichment and the project's **Discard IP data** setting. The raw-IP view requires IP retention; the obsolete JavaScript `ip` option has no effect. IP and city estimates are not a person's identity or precise location.
5. Create the private dashboard below and enable `enabled` in the site config. Rebuild and publish. The privacy page automatically changes to describe active collection.
6. Validate one consenting session end to end in Live events, Web analytics, Heatmaps, and Session replay. Check that decline and withdrawal stop collection and that search inputs are absent from replay.

## Dashboard: Oddly — readership & experience

The private dashboard is pinned and set as the project's default, with a last-30-days filter and all insights scoped to `site = oddly.fyi`. All 16 panels were executed successfully against live collection on September 28, 2026.

| Panels | Data |
| --- | --- |
| Unique browsers, sessions, pageviews, engaged article sessions | Four headline metrics |
| Daily readership | Pageviews and unique browsers over time |
| Popular pages | Pageviews by page path |
| Traffic sources and campaigns | Referring domains and UTM campaigns |
| Readers around the world | Event-level country map from approximate GeoIP |
| Devices and browsers | Device and browser breakdowns |
| Reading depth | Scroll milestones at 25/50/75/90 percent |
| Visible reading time by article | Visible seconds grouped by article |
| Outbound destinations | Link destinations without query strings |
| Recent visits — IP and location (30 days) | Latest 100 pageviews with IP, country, city, page, browser, and session ID; fixed 30-day window |
| Errors and interaction friction | Exceptions, rage clicks, and dead clicks |

The dashboard introduction links to native Web analytics, Session replay, Heatmaps, and Web Vitals. These provide entry/exit views, individual journeys, click and scroll hotspots, and performance metrics. No dashboard or recording sharing was enabled.

Three saved heatmaps cover the homepage, local-context article, and checkpoint-replay article. Each has completed snapshots at 375, 768, and 1440 pixels. Replay, IP retention, session IDs, country/city enrichment, consent acceptance, decline, and withdrawal were verified live. This setup creates no historical traffic; initial data includes setup verification visits.

## Collection behavior

- The SDK is downloaded only after opt-in, on the production domains. There are no PostHog requests when the project is unconfigured, consent is declined, or DNT/GPC is set.
- Preferences persist for 180 days. Withdrawal stops replay and capture and clears SDK persistence. It does not retroactively delete server data.
- No reader identification or person profiles. Counts describe browsers and sessions, not verified people. Consent choices, blockers, shared devices, and clearing storage affect counts.
- Only clicks on links/buttons are autocaptured; element text and attributes are masked. Replay blocks the search dialog, inputs, textareas, selects, editable areas, and `[data-private]` elements.
- Console capture, request bodies, headers, and network timing are disabled. Web Vitals and JavaScript exception capture are enabled.
- Unknown URL query parameters suppress analytics and replay for that page. Known campaign values are bounded; event URLs and referrers lose query strings and fragments.
- A visible-time interval is emitted every 30 seconds and on hide/leave, rather than counting hidden-tab time. A browser crash or blocked unload can still lose the last interval.
- The SDK's current release loads from PostHog's official asset host after consent. Replay availability still depends on project settings, sampling, blockers, and supported browsers.

## Implementation references

- https://posthog.com/docs/libraries/js
- https://github.com/PostHog/posthog-js/blob/main/packages/types/src/posthog-config.ts
- https://posthog.com/docs/session-replay/privacy
- https://posthog.com/docs/web-analytics
- https://posthog.com/docs/product-analytics/dashboards

Run `npm run publish:prepare` and `npm run check` before publishing. The checks cover missing/incorrect project configuration, consent boundaries, unexpected query parameters, and nested event URL sanitization. Repeat the live consent and ingestion check when changing project settings or the integration.
