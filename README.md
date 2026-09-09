# carlosnunez

[![Netlify Status](https://api.netlify.com/api/v1/badges/0260ba34-1e64-4a92-be35-ffa878b5b7b9/deploy-status)](https://app.netlify.com/sites/carlosn/deploys)




Personal portfolio and blog at https://andmecarlos.com/, built with Hugo and PaperMod.

## Local development

On macOS or Linux, with `make`, `curl`, and `tar` installed:

```sh
make setup
make dev
```

Open http://localhost:1313. Stop the server with Ctrl+C.
Setup installs the Hugo version pinned in `netlify.toml` into `.tools/hugo`.
The PaperMod theme is included in this repository; no submodule setup is needed.
Node.js and Netlify CLI are not required for local development.

## Build

```sh
make build
```

Local output goes to `.tools/build`, keeping the checked-in `public/` files intact.
Netlify builds with the same Hugo version and publishes to `public/`.
Edit site settings in `hugo.yml` and posts in `content/Posts/`.

## Cloudflare Pages

In the Pages project's build settings, use:

| Setting | Value |
| --- | --- |
| Framework preset | Hugo |
| Build command | `hugo --gc --minify` |
| Build output directory | `public` |
| Root directory | Leave blank (repository root) |

Set the environment variable `HUGO_VERSION` to `0.139.4` for both production
and preview builds. This is the version verified locally. Cloudflare's Hugo
version must be configured separately from `netlify.toml`.

The local `make build` command writes to `.tools/build`; use the command above
when Pages is configured to publish `public`.

Reference: https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/

### Upload with Wrangler

```sh
npx wrangler login
make build
npx wrangler pages deploy .tools/build --project-name YOUR_PAGES_PROJECT
```

Replace `YOUR_PAGES_PROJECT` with your existing Cloudflare Pages project name.
Upload the fresh `.tools/build` output, rather than the checked-in `public`
directory, which contains old development URLs. Check authentication with
`npx wrangler whoami`.
