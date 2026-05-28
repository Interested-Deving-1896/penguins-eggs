#!/usr/bin/env bash
# scripts/sync-all-features.sh — sync all-features branch and its 14 projects
#
# Steps:
#   core-upstream  — merge pieroproietti/penguins-eggs master → all-features
#   projects       — for each registry entry: sync upstream + update submodule ptr
#
# Required env:
#   GH_TOKEN       — PAT with repo + pull_requests scopes
#
# Optional env:
#   DRY_RUN        — true | false (default: false)
#   PROJECT_FILTER — only process this project name
#   GITHUB_OWNER   — org/user owning the repos (default: Interested-Deving-1896)

set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"

GITHUB_OWNER="${GITHUB_OWNER:-Interested-Deving-1896}"
DRY_RUN="${DRY_RUN:-false}"
PROJECT_FILTER="${PROJECT_FILTER:-}"
STEP="${STEP:-all}"

REGISTRY="${GITHUB_WORKSPACE:-.}/config/all-features-registry.json"
API="https://api.github.com"

# ── parse --step argument ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --step) STEP="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# ── helpers ───────────────────────────────────────────────────────────────────
info()  { echo "[sync-all-features] $*"; }
warn()  { echo "[sync-all-features][warn] $*" >&2; }
dry()   { [[ "$DRY_RUN" == "true" ]]; }

gh_api() {
  local method="$1" url="$2"; shift 2
  local resp http_code body
  resp=$(curl -s -w "\n%{http_code}" \
    -X "$method" \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@" "$url")
  http_code=$(echo "$resp" | tail -1)
  body=$(echo "$resp" | sed '$d')
  if [[ "$http_code" -ge 400 ]]; then
    warn "API ${method} ${url} → HTTP ${http_code}: $(echo "$body" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("message","?"))' 2>/dev/null || echo "$body")"
    return 1
  fi
  echo "$body"
}

merge_upstream() {
  local fork="$1" branch="$2"
  if dry; then
    info "[dry-run] would merge upstream for ${fork}@${branch}"
    return 0
  fi
  local result
  result=$(gh_api POST "${API}/repos/${fork}/merge-upstream" \
    -H "Content-Type: application/json" \
    -d "{\"branch\":\"${branch}\"}" 2>&1) || true

  local merge_type
  merge_type=$(echo "$result" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("merge_type","error"))' 2>/dev/null || echo "error")

  case "$merge_type" in
    merge)         info "  merged: ${fork}@${branch}" ;;
    fast-forward)  info "  fast-forwarded: ${fork}@${branch}" ;;
    none)          info "  already up-to-date: ${fork}@${branch}" ;;
    *)             warn "  merge failed for ${fork}@${branch}: $result" ;;
  esac
}

get_repo_default_sha() {
  local repo="$1" branch="$2"
  gh_api GET "${API}/repos/${repo}/git/ref/heads/${branch}" \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["object"]["sha"])' 2>/dev/null || echo ""
}

open_pr_if_needed() {
  local repo="$1" head_branch="$2" base_branch="$3" title="$4" body="$5"
  # Check if a PR already exists
  local existing
  existing=$(gh_api GET "${API}/repos/${repo}/pulls?head=${GITHUB_OWNER}:${head_branch}&base=${base_branch}&state=open" \
    | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d[0]["number"] if d else "")' 2>/dev/null || echo "")
  if [[ -n "$existing" ]]; then
    info "  PR #${existing} already open for ${head_branch} → ${base_branch}"
    return 0
  fi
  if dry; then
    info "[dry-run] would open PR: ${head_branch} → ${base_branch} in ${repo}"
    return 0
  fi
  local pr_num
  pr_num=$(gh_api POST "${API}/repos/${repo}/pulls" \
    -H "Content-Type: application/json" \
    -d "{\"title\":$(echo "$title" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),\"body\":$(echo "$body" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),\"head\":\"${head_branch}\",\"base\":\"${base_branch}\"}" \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["number"])' 2>/dev/null || echo "?")
  info "  opened PR #${pr_num}: ${head_branch} → ${base_branch}"
}

# ── step: core-upstream ───────────────────────────────────────────────────────
step_core_upstream() {
  local upstream_repo base_branch target_branch
  upstream_repo=$(python3 -c "import json; d=json.load(open('${REGISTRY}')); print(d['upstream_core']['repo'])")
  base_branch=$(python3 -c "import json; d=json.load(open('${REGISTRY}')); print(d['upstream_core']['branch'])")
  target_branch=$(python3 -c "import json; d=json.load(open('${REGISTRY}')); print(d['upstream_core']['target_branch'])")

  info "Core upstream: ${upstream_repo}@${base_branch} → ${GITHUB_OWNER}/penguins-eggs@${target_branch}"

  # Use merge-upstream API (works for GitHub forks)
  merge_upstream "${GITHUB_OWNER}/penguins-eggs" "$target_branch"
}

# ── step: projects ────────────────────────────────────────────────────────────
step_projects() {
  local submodule_changes=0
  local changed_projects=()

  # Read all projects from registry
  local projects_json
  projects_json=$(python3 -c "
import json, sys
d = json.load(open('${REGISTRY}'))
for p in d['projects']:
    filter_val = '${PROJECT_FILTER}'
    if filter_val and p['name'] != filter_val:
        continue
    print(json.dumps(p))
")

  while IFS= read -r project_json; do
    local name repo branch upstream upstream_branch strategy submodule_path
    name=$(echo "$project_json" | python3 -c 'import sys,json; print(json.load(sys.stdin)["name"])')
    repo=$(echo "$project_json" | python3 -c 'import sys,json; print(json.load(sys.stdin)["repo"])')
    branch=$(echo "$project_json" | python3 -c 'import sys,json; print(json.load(sys.stdin)["default_branch"])')
    upstream=$(echo "$project_json" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("upstream") or "")')
    upstream_branch=$(echo "$project_json" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("upstream_branch") or "main")')
    strategy=$(echo "$project_json" | python3 -c 'import sys,json; print(json.load(sys.stdin)["sync_strategy"])')
    submodule_path=$(echo "$project_json" | python3 -c 'import sys,json; print(json.load(sys.stdin)["submodule_path"])')

    info "Project: ${name} (${repo}@${branch}, strategy: ${strategy})"

    # Sync upstream if applicable
    if [[ "$strategy" == "merge-upstream" && -n "$upstream" ]]; then
      info "  Syncing upstream: ${upstream}@${upstream_branch} → ${repo}@${branch}"
      merge_upstream "$repo" "$branch"
    fi

    # Get current HEAD SHA of the project's default branch
    local current_sha
    current_sha=$(get_repo_default_sha "$repo" "$branch")
    if [[ -z "$current_sha" ]]; then
      warn "  Could not get SHA for ${repo}@${branch}, skipping submodule update"
      continue
    fi

    # Check what SHA the submodule currently points to in all-features
    local recorded_sha=""
    if [[ -f "${submodule_path}/.git" ]] || git ls-files --error-unmatch "${submodule_path}" &>/dev/null 2>&1; then
      recorded_sha=$(git ls-tree HEAD "${submodule_path}" 2>/dev/null | awk '{print $3}' || echo "")
    fi

    if [[ "$current_sha" == "$recorded_sha" ]]; then
      info "  Submodule pointer up-to-date (${current_sha:0:8})"
      continue
    fi

    info "  Submodule pointer: ${recorded_sha:0:8} → ${current_sha:0:8}"

    if dry; then
      info "[dry-run] would update submodule pointer for ${submodule_path}"
      continue
    fi

    # Update the submodule pointer
    mkdir -p "$(dirname "${submodule_path}")"
    # Register the submodule if not already initialized
    if ! git config --file .gitmodules "submodule.${submodule_path}.url" &>/dev/null; then
      git submodule add --force \
        "https://github.com/${repo}.git" \
        "${submodule_path}" 2>/dev/null || true
    fi
    git update-index --add --cacheinfo "160000,${current_sha},${submodule_path}"

    submodule_changes=$(( submodule_changes + 1 ))
    changed_projects+=("$name")

  done <<< "$projects_json"

  # Commit and push submodule pointer updates
  if [[ $submodule_changes -gt 0 ]]; then
    local commit_msg="chore(submodules): update all-features integration pointers

Updated submodule pointers for: ${changed_projects[*]}

Co-authored-by: Ona <no-reply@ona.com>"

    git add .gitmodules
    git commit -m "$commit_msg" || true

    if dry; then
      info "[dry-run] would push submodule pointer updates to all-features"
    else
      git push origin all-features
      info "Pushed ${submodule_changes} submodule pointer update(s)"
    fi
  else
    info "All submodule pointers are current"
  fi
}

# ── dispatch ──────────────────────────────────────────────────────────────────
[[ "$DRY_RUN" == "true" ]] && info "DRY RUN — no changes will be made"

case "$STEP" in
  core-upstream) step_core_upstream ;;
  projects)      step_projects ;;
  all)           step_core_upstream; step_projects ;;
  *) echo "Unknown step: $STEP (valid: core-upstream | projects | all)"; exit 1 ;;
esac

info "Done"
