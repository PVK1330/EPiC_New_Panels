# Production hosting (ElitePic)

## Two hosts — do not mix them

| Host | Role | Serves |
|------|------|--------|
| **cms.elitepic.co.uk** | Frontend (React) | `dist/` — `index.html`, `/assets/*.js`, CSS |
| **server.elitepic.co.uk** | Backend (Express API) | `/api/*`, `/uploads/*`, `/assets/elitepic_logo.png` (email branding only) |

`curl https://server.elitepic.co.uk/assets/index.js` **will always 404** — that path is for the Vite app on **cms**, not the API.

The API’s `/assets` folder is only for static branding files used in emails, not React bundles.

---

## Frontend deploy (cms.elitepic.co.uk)

1. On the CMS server, in the frontend project:

```bash
cp .env.production.example .env.production
# Edit:
#   VITE_API_BASE_URL=https://server.elitepic.co.uk
#   VITE_PLATFORM_DOMAIN=elitepic.co.uk

npm ci
npm run build
```

2. Deploy **everything inside `dist/`** to the domain document root (e.g. `public_html/cms.elitepic.co.uk/`):

   - `index.html`
   - `assets/` (entire folder)
   - favicons, `.htaccess`, etc.

3. **Do not** point the CMS vhost at the Node API for `/` or `/assets`.

4. Apache must serve static files; use the included `public/.htaccess` (copied into `dist/` on build).

5. Verify:

```bash
# Replace HASH with the real name from dist/index.html
curl -I https://cms.elitepic.co.uk/assets/index-HASH.js
# Expect: HTTP 200 and Content-Type: application/javascript
```

6. Tenant logins use **`https://{org-slug}.elitepic.co.uk`**, not `slug.cms.elitepic.co.uk`.

DNS: wildcard `*.elitepic.co.uk` → same server as cms (or separate, with same `dist`).

---

## API deploy (server.elitepic.co.uk)

1. `.env` (see `Server/.env.production.example`):

```env
NODE_ENV=production
PLATFORM_DOMAIN=elitepic.co.uk
FRONTEND_URL=https://cms.elitepic.co.uk
API_URL=https://server.elitepic.co.uk/api
BASE_URL=https://server.elitepic.co.uk
```

2. Reverse proxy (Apache/Nginx) only needs to forward to Node for API paths, e.g.:

   - `/api` → `http://127.0.0.1:5001`
   - Optional: `/uploads` → Node

3. **Do not** proxy `/assets/*.js` from the React build to Express unless you intentionally host the full `dist` on the API server (not recommended).

---

## MIME / “Failed to load module script” error

Cause: the browser requested a `.js` chunk but got **404 HTML** or an empty response (often from the **wrong host** or missing `dist/assets/`).

Fix:

1. Open the site at **https://cms.elitepic.co.uk** (not server.elitepic.co.uk).
2. Ensure `dist/assets/` is uploaded.
3. Ensure `.htaccess` SPA rules do **not** send `/assets/*` to `index.html` only (the provided `.htaccess` handles this).
4. If cms uses a reverse proxy to Node, exclude `/assets` and serve `dist` statically.

---

## cPanel proxy mistake (common)

**Wrong:** all traffic on cms.elitepic.co.uk → Node :5001  
→ `/assets/index-xxx.js` hits Express → 404 HTML → MIME error

**Right:** cms document root = `dist/`; only API calls go to `https://server.elitepic.co.uk/api` from the browser.
