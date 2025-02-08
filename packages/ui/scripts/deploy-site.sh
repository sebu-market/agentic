#!/usr/bin/env bash

set -euo pipefail

# ------------------------------------------------------
# 1) SETUP
# ------------------------------------------------------

# Where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." &>/dev/null && pwd)"
# TERRAFORM_DIR="$PROJECT_DIR/../terraform"
TFVARS_FILE="$TERRAFORM_DIR/config/dev.tfvars"

# verify TERRAFORM_DIR is set in env
if [[ -z "${TERRAFORM_DIR:-}" ]]; then
  echo "Error: TERRAFORM_DIR is not set in the environment."
  exit 1
fi

# Locate the top of your Git repo
GIT_REPO_ROOT="$(git rev-parse --show-toplevel)"

# Add local node_modules bin to PATH (optional)
export PATH="$GIT_REPO_ROOT/node_modules/.bin:$PATH"

# Helper: read a tfvar from dev.tfvars
function read_tfvar() {
    local var_name="$1"
    local nested_key="${2:-}"

    if [[ -n "$nested_key" ]]; then
        awk -v section="$var_name" -v key="$nested_key" '
        $0 ~ section"\\s*=\\s*{ *" {inside_section=1}
        inside_section && $0 ~ key"\\s*=\\s*" {
            gsub(/[ ",]/, "", $2); print $2; exit
        }
        inside_section && $0 ~ "}" {inside_section=0}
        ' "$TFVARS_FILE"
    else
        grep -E "^${var_name}\\s*=" "$TFVARS_FILE" \
          | awk -F'=' '{gsub(/[ ",]/, "", $2); print $2}'
    fi
}

# Bucket and domain
BUCKET="$(read_tfvar "bucket_name")"
DOMAIN="$(read_tfvar "dns" "base_domain_name")"
if [[ -z "$BUCKET" || -z "$DOMAIN" ]]; then
  echo "Error: Could not read bucket_name or base_domain_name from tfvars."
  exit 1
fi

# Ensure required commands are available
for cmd in aws git vite; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd not found."
    exit 1
  fi
done

# ------------------------------------------------------
# 2) BUILD
# ------------------------------------------------------
echo "Building the Vite project..."
vite build || {
  echo "Vite build failed."
  exit 1
}

# The local folder where vite build artifacts go
BUILD_DIR="dist"

# ------------------------------------------------------
# 3) DEPLOY (Sync to S3)
# ------------------------------------------------------

echo "Uploading build artifacts to S3 (root of the bucket)..."
aws s3 sync \
  "$BUILD_DIR/" "s3://$BUCKET/" \
  --delete \
  --exact-timestamps \
  --metadata-directive REPLACE

# ------------------------------------------------------
# 4) INVALIDATE CLOUDFRONT
# ------------------------------------------------------

echo "Creating a CloudFront invalidation..."
CLOUDFRONT_DISTRIBUTION_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw cloudfront_distribution_id)"
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "Deployment complete!"
