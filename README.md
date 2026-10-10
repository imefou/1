# Efou — Portfolio Site

A dark, cool-toned, animated personal site for Efou (@imefou).

## View locally
Just open `index.html` in a browser — no build step, no server needed.

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Extract this zip and push all the files (`index.html`, `styles.css`, `script.js`, `assets/`, this `README.md`) to the root of the repo's main branch.
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Save. Your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

The same folder also works as a drag-and-drop deploy on Netlify or Vercel.

## What to edit
- **Work section**: currently a placeholder ("Projects coming soon") — swap in real projects in `index.html` under `<section class="work">` whenever you're ready.
- **Colors**: all defined as CSS custom properties at the top of `styles.css` (`:root`) — change those to retheme the whole site.
- **Logo**: `assets/logo.gif` — replace with a different file (keep the same name, or update the `src` in `index.html`) if you want a different animated logo.
- **Contact links**: Discord, TikTok, and email links are in the `#contact` section of `index.html`.

## Notes
- No contact form was added since GitHub Pages can't receive submissions — contact goes through Discord, TikTok, and a `mailto:` link instead.
- Animations respect `prefers-reduced-motion`.
