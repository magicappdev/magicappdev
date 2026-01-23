#!/bin/bash
echo "Testing basic worker deployment..."
set -euo pipefail

echo "Testing basic worker deployment..."
if wrangler deploy --config wrangler.test.toml; then
    echo "Deployment succeeded."
else
    echo "Deployment failed. Please check the wrangler output above for details." >&2
    exit 1
fi