# Oddly

A personal publication by Chaitanya. The About page introduces Chaitanya Meesala.

Personal writing on autonomous agents, data, developer tools, and evaluation.

Target: https://oddly.fyi/

The publication includes search, dark mode, reading progress, and responsive navigation. The build keeps the 16 earlier pages at their original URLs, preserving their prose and code examples inside the current design. Their original HTML remains in `legacy/` as source.

## Build and check

Requires Node.js 24. There are no npm dependencies to install.

```sh
npm run build
npm run check
node --check src/site.js
```

The complete static website is written to `dist/`. Edit current articles and site copy in `src/content.mjs`, base styling in `src/styles.css`, the current visual system in `src/editorial.css`, and page templates in `scripts/build.mjs`. The typography system is in `src/typography.css`. IBM Plex Sans is used for all headings, prose, navigation, and examples. IBM Plex Mono handles code and compact data labels. All active fonts and their open-font licenses are served locally from `assets/fonts/`.

Reading text uses 19px on desktop and 18px on narrow screens, with generous line spacing. The same sans-serif system applies to all categories and both color themes; no serif font is loaded by publication pages.

The Writing index contains eight essays and the Trustworthy Autonomy collection in date order. The homepage shows Recent writing from the same list. The five former short notes have been removed from source, publication dates, search, feeds, and navigation; their individual URLs return 404. The old `/notes/` index continues to redirect to `/writing/`.

The Trustworthy Autonomy collection and its nine chapters are defined in `src/principle-series.mjs`. The overview appears once in the writing index and feeds; chapters live beneath `/writing/trustworthy-autonomy/`. `src/paths.mjs` owns their canonical paths. Earlier chapter URLs and `/principles/` redirect into the collection.

The local-context and checkpoint-replay essays live in `src/systems-writing.mjs`. `scripts/render-series.mjs` renders collection navigation and the shared example panels; `src/principles.js` progressively adds example navigation, with styling in `src/principles.css`. Every example is readable without JavaScript.

The five essays on environment, inquiry, examples, procedures, and recoverability live as Markdown in `src/essays/2026-10-agency/`. Their `manifest.json` contains titles, descriptions, and reading order; `src/agency-writing.mjs` loads them into the writing registry. Their publication dates are in `src/publication-dates.mjs`. “The World an Agent Can Read” is featured on the homepage, and all five appear in writing, search, and feeds. The Markdown renderer in `scripts/build.mjs` supports nested outlines and fenced code examples for the hierarchy and index examples.

PostHog integration, privacy controls, activation status, and the private dashboard are documented in `analytics/README.md`. Tracking is connected to the Oddly project and loads only after reader consent. The retired “Judgment Under Uncertainty” essay and its earlier alias intentionally return 404.

“Verdicts require Epistemics” lives in `src/epistemics.mjs`. Its illustrative checkpoint data is in `src/epistemics-incident.mjs`; `scripts/render-incident.mjs` renders all six records as readable HTML, and `src/epistemics.js` adds navigation and the topology arrows. Article styling is in `src/epistemics.css`. The earlier `/writing/epistemics-how-do-we-know/` address redirects to the renamed article.

## Unpublished editorial drafts

Unpublished manuscripts are registered separately through `src/editorial-drafts.mjs`
and the draft directory’s `manifest.json`. The October agency manuscripts have
been promoted to published source, leaving their draft manifest empty.

Run `npm run drafts:build` to render registered drafts alongside published writing
in `dist-drafts/` and generate a self-contained editorial reader. Run
`npm run drafts:check` to validate the preview pages. Draft previews are marked
noindex, disable analytics, and cannot use `--publish-root`.

The default build excludes unpublished drafts. To publish a manuscript, move it
into published source, register it in the writing and publication-date registries,
and remove its draft entry so the preview does not render it twice.

## Publish

This site uses GitHub Pages publishing from the root of `master`. The `.nojekyll` file makes GitHub serve the generated static pages directly. The existing publishing source does not need to change.

After changing source files, refresh the published files and commit both source and output:

```sh
npm run publish:prepare
npm run check
```

Push or merge the commit into `master` to publish. The validation workflow checks pages, JavaScript syntax, and agreement between source and the committed static output. Pull requests validate without changing the live site.

The old Markdown files remain as historical source; the build generates the live homepage from the newer site's templates. RSS links and canonical URLs use `https://oddly.fyi/`. `/feed.xml` remains available alongside `/rss.xml`, and `/atom.xml` serves an Atom feed for the links in the older pages. Earlier essay URLs redirect to their current versions through aliases declared in `src/content.mjs`.


GitHub Pages publishing reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
