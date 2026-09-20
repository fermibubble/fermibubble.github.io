# Chaitanya Meesala's website

Personal writing on engineering autonomous agents, embedding trustworthiness, and learning from experience.

Target: https://oddly.fyi/

This update imports the newer September 3, 2026 website. It preserves the writing, design, search, dark mode, reading progress, and responsive navigation. The build also keeps the existing 16 legacy pages at their original URLs, with their original styles and code examples. The old Markdown sources remain in this repository; their published HTML is preserved in `legacy/`.

## Build and check

Requires Node.js 24. There are no npm dependencies to install.

```sh
npm run build
npm run check
node --check src/site.js
```

The complete static website is written to `dist/`. Edit current articles and site copy in `src/content.mjs`, styling in `src/styles.css`, and page templates in `scripts/build.mjs`.

## Publish

This site uses GitHub Pages publishing from the root of `master`. The `.nojekyll` file makes GitHub serve the generated static pages directly. The existing publishing source does not need to change.

After changing source files, refresh the published files and commit both source and output:

```sh
npm run publish:prepare
npm run check
```

Push or merge the commit into `master` to publish. The validation workflow checks pages, JavaScript syntax, and agreement between source and the committed static output. Pull requests validate without changing the live site.

The old Markdown files remain as historical source; the build generates the live homepage from the newer site's templates. RSS links and canonical URLs use `https://oddly.fyi/`. `/feed.xml` remains available alongside `/rss.xml`, and `/atom.xml` serves an Atom feed for the links in the older pages. Earlier essay URLs redirect to their current versions through aliases declared in `src/content.mjs`.

The private preview remains available at https://chaitanya-meesala.fermibubble.chatgpt.site . Its hosting configuration and credentials are not part of this repository.

GitHub Pages publishing reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
