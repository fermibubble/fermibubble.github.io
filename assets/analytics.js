import { analyticsConfig } from "./analytics-config.mjs";
import { analyticsReady, trackingAllowed, cleanUrl, safePageQuery, scrubEvent } from "./analytics-policy.js";

const consentKey = "oddly-analytics-consent-v1";
const consentLifetime = 180 * 24 * 60 * 60 * 1000;
const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
const configured = analyticsReady(analyticsConfig);
const production = analyticsConfig.productionHosts.includes(location.hostname);
let choice = "unknown";
try {
  const saved = JSON.parse(localStorage.getItem(consentKey) || "null");
  if (saved?.expires > Date.now() && ["accepted", "declined"].includes(saved.choice)) choice = saved.choice;
} catch { /* The page works when storage is unavailable. */ }

const allowed = () => trackingAllowed(choice, privacySignal, configured, production) && safePageQuery(location.search);
let sdk;
let sdkRequested = false;
let banner;
let activeMilliseconds = 0;
let activeSince = 0;
let deepestScroll = 0;
let lastEngagement = 0;
const milestones = new Set();
const article = document.querySelector("[data-article-body]");
const path = document.body.dataset.path || location.pathname;
const pageType = path.startsWith("/writing/trustworthy-autonomy/") ? "collection" :
  path.startsWith("/writing/") ? "essay" : path.startsWith("/notes/") ? "note" : "page";

function capture(name, properties = {}) {
  if (allowed() && sdk) sdk.capture(name, { page_path: path, page_type: pageType, ...properties });
}

function accountTime() {
  const now = performance.now();
  if (activeSince) activeMilliseconds += Math.max(0, now - activeSince);
  activeSince = document.visibilityState === "visible" && allowed() && sdk ? now : 0;
}

function flushEngagement() {
  accountTime();
  if (!article || activeMilliseconds - lastEngagement < 1000) return;
  const interval = Math.round((activeMilliseconds - lastEngagement) / 1000);
  capture("article_engagement", { active_seconds: interval, max_scroll_percent: deepestScroll });
  lastEngagement = activeMilliseconds;
}

function measureScroll() {
  if (!article || !allowed() || !sdk) return;
  const box = article.getBoundingClientRect();
  const fraction = Math.max(0, Math.min(1, (innerHeight - box.top) / Math.max(1, box.height)));
  deepestScroll = Math.max(deepestScroll, Math.round(fraction * 100));
  for (const percent of [25, 50, 75, 90]) {
    if (deepestScroll >= percent && !milestones.has(percent)) {
      milestones.add(percent);
      capture("article_scroll", { percent });
    }
  }
  accountTime();
  if (deepestScroll >= 90 && activeMilliseconds >= 30000 && !milestones.has("engaged")) {
    milestones.add("engaged");
    capture("article_engaged", { active_seconds: Math.round(activeMilliseconds / 1000) });
  }
}

function beginPage() {
  if (!allowed() || !sdk) return;
  sdk.opt_in_capturing({ captureEventName: false });
  sdk.register({ site: "oddly.fyi", page_path: path, page_type: pageType });
  sdk.capture("$pageview", { $current_url: cleanUrl(location.href) });
  if (article) capture("article_viewed", { article_title: document.querySelector("h1")?.textContent.trim() });
  accountTime();
  measureScroll();
}

function loadAnalytics() {
  if (!allowed()) return;
  if (sdk) { beginPage(); sdk.startSessionRecording(); return; }
  if (sdkRequested) return;
  sdkRequested = true;
  // Official PostHog snippet, with its loader kept behind consent.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],o="init capture register opt_in_capturing opt_out_capturing startSessionRecording stopSessionRecording".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(analyticsConfig.projectToken, {
    api_host: analyticsConfig.apiHost,
    ui_host: analyticsConfig.uiHost,
    defaults: "2026-05-30",
    persistence: "localStorage",
    person_profiles: "never",
    cross_subdomain_cookie: false,
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    respect_dnt: true,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
    mask_all_element_attributes: true,
    mask_all_text: true,
    mask_personal_data_properties: true,
    property_denylist: ["$search_keyword", "$initial_search_keyword", "gclid", "fbclid", "msclkid"],
    capture_heatmaps: true,
    capture_dead_clicks: true,
    rageclick: true,
    capture_performance: { web_vitals: true, network_timing: false },
    capture_exceptions: true,
    disable_surveys: true,
    enable_recording_console_log: false,
    session_recording: {
      maskAllInputs: true,
      blockSelector: "[data-private], [data-search-dialog], input, textarea, select, [contenteditable]",
      maskTextSelector: "[data-private]",
      recordHeaders: false,
      recordBody: false,
      maskCapturedNetworkRequestFn: (request) => ({ ...request, name: cleanUrl(request.name) }),
    },
    before_send: (event) => allowed() ? scrubEvent(event) : null,
    loaded: (client) => {
      sdk = client;
      if (allowed()) beginPage();
      else { client.stopSessionRecording(); client.opt_out_capturing(); }
    },
  });
}

function saveChoice(next) {
  accountTime();
  choice = next;
  try { localStorage.setItem(consentKey, JSON.stringify({ choice, expires: Date.now() + consentLifetime })); } catch {}
  if (next === "accepted") loadAnalytics();
  else {
    sdk?.stopSessionRecording();
    sdk?.opt_out_capturing({ clear_persistence: true });
    activeSince = 0;
    activeMilliseconds = 0;
    lastEngagement = 0;
    deepestScroll = 0;
    milestones.clear();
  }
  banner?.remove();
  banner = null;
}

function showChoices() {
  if (banner || !configured || !production) return;
  banner = document.createElement("section");
  banner.className = "analytics-choice ph-no-capture";
  banner.setAttribute("aria-label", "Analytics preferences");
  banner.innerHTML = privacySignal
    ? '<strong>Analytics is off</strong><p>Your browser’s privacy preference is being respected.</p><button type="button" data-close>Close</button>'
    : '<strong>Help improve Oddly</strong><p>Allow analytics and session replay to show which pages work well. This includes clicks, reading activity, IP address and approximate location. Inputs are masked. <a href="/privacy/">Details</a></p><div><button type="button" data-decline>Decline</button><button type="button" data-accept>Allow analytics</button></div>';
  banner.querySelector("[data-accept]")?.addEventListener("click", () => saveChoice("accepted"));
  banner.querySelector("[data-decline]")?.addEventListener("click", () => saveChoice("declined"));
  banner.querySelector("[data-close]")?.addEventListener("click", () => { banner.remove(); banner = null; });
  document.body.append(banner);
}

if (configured && production) {
  document.querySelectorAll("[data-analytics-settings]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", showChoices);
  });
  // Preferences open only when the reader selects the footer control.
  loadAnalytics();
  window.addEventListener("scroll", measureScroll, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEngagement();
    else accountTime();
  });
  window.addEventListener("pagehide", flushEngagement);
  window.addEventListener("storage", (event) => {
    if (event.key !== consentKey) return;
    try {
      const saved = JSON.parse(event.newValue || "null");
      choice = saved?.expires > Date.now() ? saved.choice : "unknown";
    } catch { choice = "unknown"; }
    if (!allowed()) { sdk?.stopSessionRecording(); sdk?.opt_out_capturing({ clear_persistence: true }); activeSince = 0; }
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || link.closest("[data-private], [data-search-dialog], .ph-no-capture")) return;
    const destination = new URL(link.href, location.href);
    if (/^https?:$/.test(destination.protocol) && destination.origin !== location.origin) {
      capture("outbound_link", { destination: cleanUrl(destination.href) });
    }
  });
  window.setInterval(() => { measureScroll(); flushEngagement(); }, 30000);
}
