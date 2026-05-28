#!/usr/bin/env bash
# scripts/sync-registry-sources.sh — delegation shim
#
# The canonical implementation lives in:
#   Interested-Deving-1896/fork-sync-all  scripts/sync-registry-sources.sh
#
# This shim exists so that local invocations (e.g. from a developer checkout
# or a self-hosted runner that has fork-sync-all checked out alongside this
# repo) work without modification. In CI the sync-registry-sources.yml workflow
# checks out fork-sync-all and calls its script directly — this file is not
# used by that workflow.
#
# Usage (local):
#   FORK_SYNC_ALL=/path/to/fork-sync-all \
#   REGISTRY_FILE=config/all-features-registry.json \
#   GH_TOKEN=... GITHUB_OWNER=Interested-Deving-1896 \
#   bash scripts/sync-registry-sources.sh
#
# If FORK_SYNC_ALL is not set, falls back to fetching the registry from this
# repo and delegating via the GitHub API workflow_dispatch trigger.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Local fork-sync-all checkout path ────────────────────────────────────────
FORK_SYNC_ALL="${FORK_SYNC_ALL:-}"

if [[ -n "$FORK_SYNC_ALL" && -f "${FORK_SYNC_ALL}/scripts/sync-registry-sources.sh" ]]; then
  echo "[shim] delegating to ${FORK_SYNC_ALL}/scripts/sync-registry-sources.sh"
  # Default registry to this repo's config if not already set
  export REGISTRY_FILE="${REGISTRY_FILE:-${SCRIPT_DIR}/../config/all-features-registry.json}"
  exec bash "${FORK_SYNC_ALL}/scripts/sync-registry-sources.sh" "$@"
fi

# ── API dispatch fallback ─────────────────────────────────────────────────────
# No local fork-sync-all checkout — trigger the workflow via GitHub API.
: "${GH_TOKEN:?GH_TOKEN is required for API dispatch fallback}"
GITHUB_OWNER="${GITHUB_OWNER:-Interested-Deving-1896}"
DRY_RUN="${DRY_RUN:-false}"

echo "[shim] FORK_SYNC_ALL not set — triggering sync-registry-sources workflow in fork-sync-all"

curl -fsSL \
  -X POST \
  -H "Authorization: token ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${GITHUB_OWNER}/fork-sync-all/actions/workflows/sync-registry-sources.yml/dispatches" \
  -d "{
    \"ref\": \"main\",
    \"inputs\": {
      \"registry_repo\":   \"${GITHUB_OWNER}/penguins-eggs\",
      \"registry_branch\": \"all-features\",
      \"registry_path\":   \"config/all-features-registry.json\",
      \"dry_run\":         \"${DRY_RUN}\"
    }
  }"

echo "[shim] workflow dispatch sent to ${GITHUB_OWNER}/fork-sync-all"
