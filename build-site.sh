#!/usr/bin/env bash
set -euo pipefail

# Build the Hugo site inside a container using jguyomard/hugo-builder (extended)
# Output goes to website/public
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$SCRIPT_DIR/website"

IMAGE="jguyomard/hugo-builder:latest"

echo "Using Hugo image: $IMAGE"

docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$SITE_DIR":/src \
  -w /src \
  "$IMAGE" \
  hugo --minify --cleanDestinationDir

echo "Build completed. Output: $SITE_DIR/public"
