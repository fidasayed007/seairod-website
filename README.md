# Seairod Logistics — Website

Static one-page site. No build step — plain HTML, CSS, and JS.

## Structure
```
seairod-website/
├── index.html      # markup
├── style.css       # all styles (Montserrat headings / Inter body)
├── script.js       # interactions: modals, multi-step quote form, chargeable-weight calc, Netlify form submit
├── assets/         # logos, icons, downloadable documents (PDFs, etc.)
├── images/         # photos / image files
├── netlify.toml    # serves the site from repo root
└── .gitignore
```

The logo is currently an inline SVG in `index.html`. To use an image file instead,
drop it in `assets/` (e.g. `assets/logo.svg`) and replace the inline `<svg>` in the
nav and footer with `<img src="assets/logo.svg" alt="Seairod Logistics">`.

## Deploy: GitHub → Netlify → seairod.com
1. Create a new GitHub repo and push the **contents of this folder** to the repo root.
   ```
   git init
   git add .
   git commit -m "Initial Seairod website"
   git branch -M main
   git remote add origin https://github.com/<you>/seairod-website.git
   git push -u origin main
   ```
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
   - Build command: *(leave empty)*
   - Publish directory: `.` (root)
   - Deploy.
3. Connect the domain: **Domain management → Add a domain → seairod.com**, then follow
   Netlify's DNS instructions at your registrar. HTTPS is issued automatically.

## Forms (Netlify Forms)
Both forms are already wired: `quote` (multi-step) and `contact`. After deploying,
view entries under **Forms** in the Netlify dashboard, and add an email alert under
**Forms → Form notifications**. Submit one test entry after the first deploy to confirm.
Testing GitHub → Netlify auto deployment.
