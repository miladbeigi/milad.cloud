# Personal Website with Next.js and S3 + CloudFront

Personal static website built with Next.js and deployed to AWS S3 + CloudFront using Terraform. The setup also manages DNS with Route 53 and TLS certificates via ACM.

## Project structure

- `website/`: Next.js app configured for static export (`output: "export"`), producing static files in `website/out/`
- `tf/`: Terraform to provision:
  - S3 bucket for static website hosting
  - CloudFront distribution (HTTPS, custom domain)
  - Route 53 hosted zone and A/ALIAS records
  - ACM certificate (in `us-east-1` for CloudFront)
  - Remote Terraform state (S3 + DynamoDB) via module `miladbeigi/backend-state/aws`

## Build the website

```bash
cd website
pnpm run build
# With next.config.mjs (output: "export"), static files are emitted to ./out
```

Local development:

```bash
pnpm run dev
```

## Deploy static files to S3

After provisioning, deploy the static export to the bucket (default `milad.cloud`).

```bash
export BUCKET=milad.cloud

# Long cache for assets (exclude HTML)
aws s3 sync website/out s3://$BUCKET \
  --delete \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"

# Short cache for HTML files
aws s3 sync website/out s3://$BUCKET \
  --exclude "*" --include "*.html" \
  --cache-control "public,max-age=60"
```

Invalidate CloudFront to pick up changes quickly (replace with your distribution id):

```bash
aws cloudfront create-invalidation \
  --distribution-id <CLOUDFRONT_DISTRIBUTION_ID> \
  --paths '/*'
```