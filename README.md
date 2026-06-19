# GreenSquare

The GreenSquare marketing site. Static HTML, CSS and a little JavaScript. No build step,
no dependencies, no framework.

## Run locally

It is just static files. Either open `index.html` in a browser, or serve the folder:

```bash
# Python
python -m http.server 8000
# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Structure

- `index.html`, `product.html`, `evidence.html`, `methodology.html`, `decision-frame.html` — the pages
- `404.html` — branded not-found page
- `assets/styles.css` — the entire design system (all colour and type tokens live in `:root`)
- `assets/site.js` — scroll reveal, mobile nav, reduced-motion handling
- `assets/` — logos, videos, posters, favicon, OG image
- `sitemap.xml`, `robots.txt` — SEO

See `CLAUDE.md` for brand system, locked decisions, voice rules and outstanding tasks.

## Deploy

Hosted on GitHub Pages (and intended for the custom domain `greensquare.ai`). Pushing to the
default branch publishes. To attach the custom domain, add a `CNAME` file with `www.greensquare.ai`
and point DNS at GitHub Pages.

## Outstanding

- Wire the email signup forms to Kit (ConvertKit). They are stubbed; see the comment above each form.
- Connect the custom domain and DNS.
- Optionally compress `assets/demo.mp4` (currently ~4.75 MB).
