# Context

The project is functionally complete for V1. It's already configured for Cloudflare Pages (`wrangler.jsonc` exists with project name `octodeck`, `pages_build_output_dir: dist`). The backend is Cloudflare Pages Functions under `functions/api/`. No CI/CD pipeline existed.

Goal: set up automated deployment via GitHub Actions to Cloudflare Pages (`octodeck.pages.dev`). Custom domain deferred.

---

## Files created

- `.github/workflows/deploy.yml` — CI + deploy workflow

---

## Workflow summary

**CI job** (all branches/PRs): checkout → setup node 24 → `npm ci` → lint → test → build

**Deploy job** (main only, needs CI, environment: production): checkout → setup node 24 → `npm ci` → build → `wrangler pages deploy dist --project-name=octodeck`

---

## Manual setup (one-time, outside of code)

### GitHub repo secrets (Settings → Secrets and variables → Actions)

| Name                    | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | CF custom token with "Cloudflare Pages: Edit" (Account) permission |
| `CLOUDFLARE_ACCOUNT_ID` | From Cloudflare dashboard right sidebar                            |

### Cloudflare Pages secrets

Run for each: `npx wrangler pages secret put <NAME> --project-name=octodeck`

| Name                   | Notes                               |
| ---------------------- | ----------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub App OAuth client ID          |
| `GITHUB_CLIENT_SECRET` | GitHub App OAuth client secret      |
| `SESSION_CRYPTO_KEY`   | Generate: `openssl rand -base64 32` |
| `ALLOWED_ORIGIN`       | `https://octodeck.pages.dev`        |

### Cloudflare Pages environment variables (non-secret)

Set in dashboard: Pages → octodeck → Settings → Environment variables

| Name                    | Value                |
| ----------------------- | -------------------- |
| `VITE_GITHUB_CLIENT_ID` | GitHub App client ID |
| `VITE_DEMO_MODE`        | `false`              |

### GitHub App settings

Update callback URL to: `https://octodeck.pages.dev/api/callback`

### Cloudflare Pages project (if not yet created)

```bash
npx wrangler pages project create octodeck
```

---

## Verification

1. Push to `main` → GitHub Actions workflow runs and passes
2. Visit `https://octodeck.pages.dev` → app loads
3. OAuth login flow completes end-to-end
4. PR branches get preview deployments at `*.octodeck.pages.dev` automatically
