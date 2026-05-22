#!/usr/bin/env bash
#
# kport-neon-env.sh — KDE Neon build environment setup
#
# Configures apt sources for a KDE Neon channel and installs the Qt6/KF6/
# Plasma build dependencies needed to compile against Neon's stack.
#
# Channels:
#   stable    — archive.neon.kde.org/user          (production)
#   unstable  — archive.neon.kde.org/unstable       (pre-release)
#   nightly   — archive.neon.kde.org/testing        (CI snapshots)
#
# Usage:
#   bash scripts/kport/kport-neon-env.sh [--channel stable|unstable|nightly]
#                                        [--install-deps]
#                                        [--export]
#                                        [--json]
#
# With --install-deps: adds the Neon apt source and installs Qt6/KF6 dev
#   packages. Requires sudo. Intended for CI runners and dev containers.
#
# With --export: prints KEY=VALUE lines suitable for eval in a shell or
#   GitHub Actions $GITHUB_ENV. Does not modify apt sources.
#
# With --json: prints a JSON object of all NEON_* variables.
#
# Variables set after sourcing / --export:
#   NEON_CHANNEL        — active channel name (stable/unstable/nightly)
#   NEON_APT_URL        — base apt repository URL
#   NEON_SUITE          — apt suite (jammy / noble depending on host)
#   NEON_SIGNING_KEY    — URL of the Neon apt signing key
#   NEON_QT_VERSION     — Qt version provided by this channel (e.g. 6.7.2)
#   NEON_KF_VERSION     — KDE Frameworks version (e.g. 6.5.0)
#   NEON_PLASMA_VERSION — Plasma version (e.g. 6.1.5)
#
# This file is sourced by kport-neon-flags.sh and hw-build-env.sh.
# Source: https://github.com/Interested-Deving-1896/KPort

set -uo pipefail

# ── Channel definitions ───────────────────────────────────────────────────────

_neon_channel_url() {
  case "$1" in
    stable)   echo "https://archive.neon.kde.org/user"     ;;
    unstable) echo "https://archive.neon.kde.org/unstable"  ;;
    nightly)  echo "https://archive.neon.kde.org/testing"   ;;
    *)
      echo "[kport-neon-env] ERROR: unknown channel '$1' (stable|unstable|nightly)" >&2
      return 1
      ;;
  esac
}

# Detect host Ubuntu suite — Neon supports jammy (22.04) and noble (24.04)
_neon_detect_suite() {
  local suite
  suite=$(. /etc/os-release 2>/dev/null && echo "${UBUNTU_CODENAME:-}" || true)
  case "$suite" in
    jammy|noble) echo "$suite" ;;
    *)
      # Fall back to noble for unknown/future releases
      echo "noble"
      ;;
  esac
}

# Approximate version metadata per channel + suite.
# These are updated periodically — exact versions are resolved at install time
# via apt-cache policy. These values are used for cmake version guards only.
_neon_versions() {
  local channel="$1" suite="$2"
  case "${channel}/${suite}" in
    stable/noble)
      echo "NEON_QT_VERSION=6.7.2"
      echo "NEON_KF_VERSION=6.5.0"
      echo "NEON_PLASMA_VERSION=6.1.5"
      ;;
    stable/jammy)
      echo "NEON_QT_VERSION=6.6.3"
      echo "NEON_KF_VERSION=6.3.0"
      echo "NEON_PLASMA_VERSION=6.0.5"
      ;;
    unstable/noble|unstable/jammy)
      echo "NEON_QT_VERSION=6.8.0"
      echo "NEON_KF_VERSION=6.7.0"
      echo "NEON_PLASMA_VERSION=6.2.0"
      ;;
    nightly/*)
      echo "NEON_QT_VERSION=6.9.0"
      echo "NEON_KF_VERSION=6.8.0"
      echo "NEON_PLASMA_VERSION=6.3.0"
      ;;
    *)
      echo "NEON_QT_VERSION=6.7.2"
      echo "NEON_KF_VERSION=6.5.0"
      echo "NEON_PLASMA_VERSION=6.1.5"
      ;;
  esac
}

# ── Argument parsing ──────────────────────────────────────────────────────────

_NEON_CHANNEL="${NEON_CHANNEL:-stable}"
_INSTALL_DEPS=false
_OUTPUT_MODE="source"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --channel)      _NEON_CHANNEL="${2:-stable}"; shift 2 ;;
    --install-deps) _INSTALL_DEPS=true;           shift   ;;
    --export)       _OUTPUT_MODE="export";        shift   ;;
    --json)         _OUTPUT_MODE="json";          shift   ;;
    *)              shift ;;
  esac
done

# ── Resolve values ────────────────────────────────────────────────────────────

_NEON_APT_URL=$(_neon_channel_url "$_NEON_CHANNEL")
_NEON_SUITE=$(_neon_detect_suite)
_NEON_SIGNING_KEY="https://archive.neon.kde.org/public.key"

# Export core vars into current shell scope
export NEON_CHANNEL="$_NEON_CHANNEL"
export NEON_APT_URL="$_NEON_APT_URL"
export NEON_SUITE="$_NEON_SUITE"
export NEON_SIGNING_KEY="$_NEON_SIGNING_KEY"

# Version metadata
while IFS='=' read -r k v; do
  export "$k"="$v"
done < <(_neon_versions "$_NEON_CHANNEL" "$_NEON_SUITE")

# ── Install deps (CI / dev container) ────────────────────────────────────────

if [[ "$_INSTALL_DEPS" == "true" ]]; then
  echo "[kport-neon-env] Adding KDE Neon ${_NEON_CHANNEL} apt source (${_NEON_SUITE})..."

  # Add signing key
  curl -fsSL "$_NEON_SIGNING_KEY" \
    | sudo gpg --dearmor -o /usr/share/keyrings/neon-archive-keyring.gpg

  # Add apt source
  echo "deb [signed-by=/usr/share/keyrings/neon-archive-keyring.gpg] \
${_NEON_APT_URL} ${_NEON_SUITE} main" \
    | sudo tee /etc/apt/sources.list.d/neon-${_NEON_CHANNEL}.list > /dev/null

  sudo apt-get update -qq

  echo "[kport-neon-env] Installing Qt6/KF6 build dependencies..."
  sudo apt-get install -y --no-install-recommends \
    qt6-base-dev \
    qt6-base-private-dev \
    qt6-tools-dev \
    qt6-tools-dev-tools \
    qt6-l10n-tools \
    libqt6core5compat6-dev \
    libqt6svg6-dev \
    libqt6waylandclient6-dev \
    extra-cmake-modules \
    libkf6config-dev \
    libkf6coreaddons-dev \
    libkf6i18n-dev \
    libkf6iconthemes-dev \
    libkf6widgetsaddons-dev \
    libkf6windowsystem-dev \
    libkf6service-dev \
    libkf6notifications-dev \
    libkf6xmlgui-dev \
    cmake \
    ninja-build \
    pkg-config \
    2>/dev/null

  echo "[kport-neon-env] Neon ${_NEON_CHANNEL} environment ready."
fi

# ── Output ────────────────────────────────────────────────────────────────────

_NEON_VARS=(
  "NEON_CHANNEL=${NEON_CHANNEL}"
  "NEON_APT_URL=${NEON_APT_URL}"
  "NEON_SUITE=${NEON_SUITE}"
  "NEON_SIGNING_KEY=${NEON_SIGNING_KEY}"
  "NEON_QT_VERSION=${NEON_QT_VERSION:-}"
  "NEON_KF_VERSION=${NEON_KF_VERSION:-}"
  "NEON_PLASMA_VERSION=${NEON_PLASMA_VERSION:-}"
)

case "$_OUTPUT_MODE" in
  export)
    for kv in "${_NEON_VARS[@]}"; do
      echo "$kv"
    done
    ;;
  json)
    python3 -c "
import json, sys
pairs = [line.split('=', 1) for line in sys.argv[1:]]
print(json.dumps({k: v for k, v in pairs}, indent=2))
" "${_NEON_VARS[@]}"
    ;;
  source)
    echo "[kport-neon-env] Channel: ${NEON_CHANNEL}  Suite: ${NEON_SUITE}" >&2
    echo "[kport-neon-env] Qt: ${NEON_QT_VERSION:-?}  KF: ${NEON_KF_VERSION:-?}  Plasma: ${NEON_PLASMA_VERSION:-?}" >&2
    ;;
esac
