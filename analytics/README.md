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

## Dashboard: Oddly — readership and experience

Scope every insight to `site = oddly.fyi`; default to the last 30 days, with comparison to the previous period.

| Panel | Data |
| --- | --- |
| Audience | Unique browser IDs, sessions, pageviews; daily trend |
| New and returning readers | First visit versus returning browser, with consent coverage caveat |
| Popular writing | `$pageview` and `article_viewed`, grouped by page path |
| Discovery | Referring domain, UTM source, medium, and campaign |
| Entry and exit pages | Native Web analytics session entry/exit view |
| Geography | Country, region, city; approximate GeoIP map |
| Devices | Browser, OS, device type, viewport sizes |
| Article depth | `article_scroll` at 25/50/75/90 percent, by page |
| Engaged reads | `article_engaged`: at least 90% depth and 30 visible seconds; an engagement proxy, not proof of reading |
| Time on articles | Sum `article_engagement.active_seconds` per session and page |
| Outbound links | `outbound_link.destination`, without query strings |
| Friction | Rage clicks, dead clicks, and error-tracking links |
| Performance | Native Web Vitals: LCP, INP, CLS, FCP |
| Visits by IP | Private event table: timestamp, `$ip`, GeoIP fields, page path, browser, session ID, when IP retention is enabled |

Use PostHog's native **Heatmaps** for click and scroll hotspots, **Session replay** for individual journeys, and **Error tracking** for JavaScript failures. Link them from the dashboard; recordings are not ordinary chart tiles.

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

Run `npm run publish:prepare` and `npm run check` before publishing. The checks cover missing/incorrect project configuration, consent boundaries, unexpected query parameters, and nested event URL sanitization. End-to-end ingestion and replay still require the real connected project.
