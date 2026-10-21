# Yashvardhan Goel · Personal Website

A single-page personal site built in the spirit of an Apple product page: refined
minimalism, generous whitespace, large editorial typography, and smooth scroll-driven
reveals. No build step, no dependencies. Just open `index.html`.

## Stack
- Plain HTML + CSS + vanilla JS (zero frameworks, zero build)
- Fonts via Google Fonts: **Hanken Grotesk** (UI), **Instrument Serif** (editorial accents), **JetBrains Mono** (labels)
- Motion driven by `IntersectionObserver`; everything degrades gracefully and respects `prefers-reduced-motion`

## Files
```
index.html          content + structure
blogs/index.html    full blog list  (yash2002vardhan.github.io/blogs)
youtube/index.html  full video list (yash2002vardhan.github.io/youtube)
content.js          blog posts + videos, shared by all three pages
styles.css          design system + layout + responsive
script.js           blog/video cards, scroll reveals, count-up stats, nav, card spotlight
```

## Adding a blog post or video
Add an entry at the **top** of the `blogs` or `videos` list in `content.js`
(newest first). The homepage shows the latest 3 posts and 6 videos, and shows a
"View all" link once there are more; the `/blogs` and `/youtube` pages show
everything. Blog dates are `YYYY-MM-DD`.

## Run locally
Serve it, so the `/blogs` and `/youtube` links resolve:
```
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages
Copy these files into your `yash2002vardhan.github.io` repo root, commit, and push.
The site goes live at https://yash2002vardhan.github.io/.

## Links
All content is pulled from your resume. Live links:

| Where | Value |
|-------|-------|
| Email | `yashvardhan090202@gmail.com` |
| Phone | `+91 93107 20186` |
| LinkedIn | `linkedin.com/in/yashvardhangoel02` |
| TL;DAI | Google Play Store listing |
| GitHub | `github.com/yash2002vardhan` |

The project cards currently point at your GitHub profile. Point each one at its
specific repo if you'd like deep links.

## Easy tweaks
- **Accent color:** change `--accent` in `styles.css` (`:root`)
- **Add a photo:** the design is intentionally text-forward; an avatar can slot into the hero or about section
