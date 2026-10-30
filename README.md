# For My Chinni · 5.5 Years of Us

A single-page, fully static love-letter website: HTML, CSS and a little vanilla JavaScript. No framework, no build step, no backend, no analytics, no external requests (fonts and images are bundled).

## What's inside

```
index.html          the whole story (semantic, readable without JavaScript)
css/styles.css      all styling, animation and responsive rules
css/fonts.css       @font-face rules for the bundled fonts
js/main.js          opening screen, scroll reveals, count-up, lightbox
fonts/              Cormorant Garamond, Jost, Caveat (Latin subsets, SIL OFL)
images/             web-optimised photos used by the site
favicon.svg
.github/workflows/pages.yml   optional GitHub Pages deployment
```

Every path in the site is **relative** (`images/…`, `css/…`), so it works on a GitHub Pages project URL such as `https://<user>.github.io/<repo>/` without any configuration.

## Preview locally

Any static file server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly from the file system also works in most browsers.)

## Deploy to GitHub Pages

Nothing has been committed, pushed or published for you. When you're happy with the result:

### Option A: GitHub Actions (recommended)

The included workflow publishes only the files the site needs (`index.html`, `css`, `js`, `fonts`, `images`, `favicon.svg`).

1. Create a repository on GitHub and push this project to the `main` branch.
2. In the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main` (or run the workflow from the **Actions** tab). The site appears at `https://<user>.github.io/<repo>/` after about a minute.

### Option B: Deploy from a branch

**Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

> A note on privacy: GitHub Pages sites are public to anyone with the link, even if the repository is private (on most plans). `index.html` includes `noindex`, so search engines are asked not to list it, but the link itself is not secret. Share it only with her.

## Customising

- **Text** lives directly in `index.html`: the letter is the `<article class="letter__body">` block.
- **Photos**: the gallery is the `#gallery` block. Captions are intentionally generic; edit `data-caption` and the visible `.tile__cap` text if you want specific ones. Add a photo by copying a `<a class="tile …">` block (the collage layout in `css/styles.css` is positioned per tile `.t1 … .t8`, so adding more means giving them a grid position).
- **Colours** are CSS variables at the top of `css/styles.css` (`--ivory`, `--blush`, `--burgundy`, `--rose`, `--brown`, `--gold`).
- **The 5.5-year milestone** is a fixed, celebratory number. No start date is assumed. If you ever want a live counter, add a verified date deliberately rather than guessing.

## About the photos

`images/` holds web-optimised WebP copies of the original photos, which are kept out of the repository (see `.gitignore`). The couple cut-out in the hero was made from one photo with Apple's on-device Vision background removal.

## Accessibility and robustness

- Works without JavaScript: the opening screen only exists when JS is running, and if `main.js` ever fails to load the screen removes itself after a few seconds.
- Respects `prefers-reduced-motion` (no drifting particles, no reveal animation, instant open).
- Keyboard: skip link, visible focus rings, chapter dots are real links, the photo viewer supports ← → Esc and a close button, and returns focus to the photo you opened.
- Photos have descriptive `alt` text; decorative elements are hidden from screen readers.
- Layout is tested from 360px phones to wide desktops with no horizontal scroll.
