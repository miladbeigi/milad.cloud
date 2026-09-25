# Personal Website with Next.js and S3 + CloudFront

Personal static website built with Next.js and deployed to AWS S3 + CloudFront using Terraform. The setup also manages DNS with Route 53 and TLS certificates via ACM.

## Project structure

- `website/`: Next.js app configured for static export (`output: "export"`), producing static files in `website/out/`
- `tf/`: Terraform to provision:
  - Private S3 bucket, readable only by CloudFront (Origin Access Control)
  - CloudFront distribution (HTTPS, custom domain, compression, security headers)
  - CloudFront function for `index.html` rewrites and the `/toolbelt` redirect
  - Route 53 hosted zone and A/ALIAS records
  - ACM certificate (in `us-east-1` for CloudFront)
  - Remote Terraform state (S3 + DynamoDB) via module `miladbeigi/backend-state/aws`

## Build the website

```bash
cd website
npm ci
npm run build   # static files are emitted to ./out
npm run lint
```

Local development:

```bash
npm run dev
```

## Deploy

Pushing to `main` (changes under `website/`) runs `.github/workflows/deploy-to-s3.yml`, which builds the site, syncs it to S3 with cache headers (a year for hashed `_next/` assets, five minutes for everything else) and invalidates CloudFront.

The invalidation step needs the `CLOUDFRONT_DISTRIBUTION_ID` repository variable:

```bash
gh variable set CLOUDFRONT_DISTRIBUTION_ID --body "$(terraform -chdir=tf output -raw cloudfront_distribution_id)"
```
