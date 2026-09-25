# Personal Website on S3 + CloudFront

Personal static website, plain HTML, CSS and JavaScript with no framework or build step, deployed to AWS S3 + CloudFront using Terraform. The setup also manages DNS with Route 53 and TLS certificates via ACM.

## Project structure

- `website/`: the site, served as is
  - `index.html`, `style.css`, `main.js`, `404.html`
  - `assets/`: images, logos, self-hosted fonts, and the data files `contributions.json` and `releases.json`
  - `scripts/refresh-data.py`: refreshes the data files (not deployed)
- `tf/`: Terraform to provision:
  - Private S3 bucket, readable only by CloudFront (Origin Access Control)
  - CloudFront distribution (HTTPS, custom domain, compression, security headers)
  - CloudFront function for `index.html` rewrites and the `/toolbelt` redirect
  - Route 53 hosted zone and A/ALIAS records
  - ACM certificate (in `us-east-1` for CloudFront)
  - Remote Terraform state (S3 + DynamoDB) via module `miladbeigi/backend-state/aws`

## Run locally

```bash
cd website
python3 -m http.server 4600
```

The page loads nothing from other origins, which the CloudFront Content-Security-Policy (`default-src 'self'`) requires: fonts are in `assets/fonts/`, and the activity graph and release tags come from same-origin JSON files.

## Data files

```bash
python3 website/scripts/refresh-data.py
```

- `assets/contributions.json` is scraped from the public GitHub contribution calendar, which counts private and SSO-organization contributions (as numbers only) that the API can't see.
- `assets/releases.json` holds the latest release tag of each project. Set `GITHUB_TOKEN` to avoid the unauthenticated rate limit.

## Deploy

Pushing to `main` (changes under `website/`) runs `.github/workflows/deploy-to-s3.yml`. It also runs daily so the data files stay current. The workflow refreshes the data files, syncs the site to S3 with cache headers (a year for fonts, a day for other assets, five minutes for HTML, CSS, JS and JSON) and invalidates CloudFront.

The invalidation step needs the `CLOUDFRONT_DISTRIBUTION_ID` repository variable:

```bash
gh variable set CLOUDFRONT_DISTRIBUTION_ID --body "$(terraform -chdir=tf output -raw cloudfront_distribution_id)"
```
