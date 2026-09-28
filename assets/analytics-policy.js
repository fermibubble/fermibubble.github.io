const campaignKeys = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);

export function analyticsReady(config) {
  return config.enabled === true && /^phc_[A-Za-z0-9]+$/.test(config.projectToken) &&
    ["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(config.apiHost) &&
    ["https://us.posthog.com", "https://eu.posthog.com"].includes(config.uiHost) &&
    config.apiHost.split(".")[0] === config.uiHost.split(".")[0];
}

export function trackingAllowed(choice, privacySignal, configured, production) {
  return choice === "accepted" && !privacySignal && configured && production;
}

export function cleanUrl(value, base = "https://oddly.fyi") {
  try {
    const url = new URL(value, base);
    if (!/^https?:$/.test(url.protocol)) return "";
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}

// A static publication has no reason to capture arbitrary query strings.
// Unknown parameters suppress collection for that page, including replay.
export function safePageQuery(search) {
  return [...new URLSearchParams(search)].every(([key, value]) =>
    campaignKeys.has(key) && /^[a-zA-Z0-9 ._~-]{0,100}$/.test(value));
}

export function scrubEvent(event) {
  if (!event?.properties) return event;
  const scrub = (value, key = "") => {
    if (Array.isArray(value)) return value.map((item) => scrub(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v, k)]));
    }
    if (typeof value === "string" && /(?:url|href|referrer)$/i.test(key)) return cleanUrl(value);
    return value;
  };
  return { ...event, properties: scrub(event.properties) };
}
