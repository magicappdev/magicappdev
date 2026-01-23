#!/bin/bash
echo "Deploying minimal agent worker..."
wrangler deploy --config wrangler.minimal.toml
echo ""
echo "Testing endpoints..."
echo "1. Root endpoint:"
curl -s https://magicappdev-agent-minimal.magicappdev.workers.dev/test
echo ""
echo ""
echo "2. Durable Object endpoint:"
curl -s https://magicappdev-agent-minimal.magicappdev.workers.dev/agents/magic-agent/default
echo ""
