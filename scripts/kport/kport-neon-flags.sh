#!/usr/bin/env bash
#
# kport-neon-flags.sh — Qt6/KF6/Plasma cmake and compiler flag derivation
#
# Derives build flags for compiling against KDE Neon's Qt6/KF6/Plasma stack,
# combining Neon channel metadata (from kport-neon-env.sh) with KPort's
# hardware tier detection (from kport-build-flags.sh).
#
# Usage:
#   source scripts/kport/kport-neon-flags.sh [--channel stable|unstable|nightly]
#   cmake $KPORT_NEON_CMAKE_ARGS ..
#
#   eval "$(bash scripts/kport/kport-neon-flags.sh --export [--channel unstable])"
#   bash scripts/kport/kport-neon-flags.sh --json [--channel nightly]
#
# Variables exported:
#   KPORT_NEON_CMAKE_ARGS   — full cmake argument string for Neon builds
#   KPORT_NEON_CXX_FLAGS    — C++ flags combining KPort tier + Qt6 requirements
#   KPORT_NEON_QT_PREFIX    — Qt6 installation prefix (from qmake6 -query)
#   KPORT_NEON_KF_PREFIX    — KF6 cmake prefix path
#   KPORT_NEON_CHANNEL      — active channel (mirrors NEON_CHANNEL)
#   KPORT_NEON_BUILD_TYPE   — Release for stable, RelWithDebInfo for others
#
# Requires kport-neon-env.sh to have been sourced first (or NEON_* vars set).
# Source: https://github.com/Interested-Deving-1896/KPort

set -uo pipefail

_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_NEON_ENV="${_SCRIPT_DIR}/kport-neon-env.sh"
_BUILD_FLAGS="${_SCRIPT_DIR}/kport-build-flags.sh"

# ── Argument parsing ──────────────────────────────────────────────────────────

_NEON_CHANNEL="${NEON_CHANNEL:-stable}"
_OUTPUT_MODE="source"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --channel) _NEON_CHANNEL="${2:-stable}"; shift 2 ;;
    --export)  _OUTPUT_MODE="export";        shift   ;;
    --json)    _OUTPUT_MODE="json";          shift   ;;
    *)         shift ;;
  esac
done

# ── Step 1: ensure Neon env vars are set ─────────────────────────────────────

if [[ -z "${NEON_APT_URL:-}" ]]; then
  if [[ -f "$_NEON_ENV" ]]; then
    eval "$(bash "$_NEON_ENV" --channel "$_NEON_CHANNEL" --export 2>/dev/null)"
  else
    echo "[kport-neon-flags] ERROR: kport-neon-env.sh not found at ${_NEON_ENV}" >&2
    echo "[kport-neon-flags] Run propagate-hw-detect to sync KPort scripts." >&2
    return 1 2>/dev/null || exit 1
  fi
fi

# ── Step 2: ensure KPort hardware flags are set ───────────────────────────────

if [[ -z "${KPORT_CFLAGS:-}" && -f "$_BUILD_FLAGS" ]]; then
  eval "$(bash "$_BUILD_FLAGS" --export 2>/dev/null)" || true
fi

# ── Step 3: resolve Qt6/KF6 prefixes ─────────────────────────────────────────

_qt_prefix=""
if command -v qmake6 >/dev/null 2>&1; then
  _qt_prefix=$(qmake6 -query QT_INSTALL_PREFIX 2>/dev/null || true)
elif command -v qmake >/dev/null 2>&1; then
  _qt_prefix=$(qmake -query QT_INSTALL_PREFIX 2>/dev/null || true)
fi
# Fall back to standard Neon install path
_qt_prefix="${_qt_prefix:-/usr}"

# KF6 cmake modules land alongside Qt6 on Neon
_kf_prefix="${_qt_prefix}"

# ── Step 4: derive build type from channel ────────────────────────────────────

case "$_NEON_CHANNEL" in
  stable)             _build_type="Release"        ;;
  unstable|nightly)   _build_type="RelWithDebInfo" ;;
  *)                  _build_type="Release"        ;;
esac

# ── Step 5: compose cmake args ────────────────────────────────────────────────

# Base Qt6/KF6 cmake args
_neon_cmake_args=(
  "-DCMAKE_BUILD_TYPE=${_build_type}"
  "-DCMAKE_PREFIX_PATH=${_qt_prefix}"
  "-DCMAKE_INSTALL_PREFIX=/usr"
  "-DQT_MAJOR_VERSION=6"
  "-DBUILD_WITH_QT6=ON"
  "-DBUILD_TESTING=OFF"
  "-DKDE_INSTALL_USE_QT_SYS_PATHS=ON"
)

# Append KPort hardware cmake args if available
if [[ -n "${KPORT_CMAKE_ARGS:-}" ]]; then
  # Merge — avoid duplicating CMAKE_BUILD_TYPE from KPORT_CMAKE_ARGS
  for arg in $KPORT_CMAKE_ARGS; do
    [[ "$arg" == *CMAKE_BUILD_TYPE* ]] && continue
    _neon_cmake_args+=("$arg")
  done
fi

_neon_cmake_str="${_neon_cmake_args[*]}"

# C++ flags: Qt6 requires C++17 minimum; combine with KPort tier flags
_base_cxxflags="-std=c++17"
if [[ -n "${KPORT_CFLAGS:-}" ]]; then
  _neon_cxx_flags="${_base_cxxflags} ${KPORT_CFLAGS}"
else
  _neon_cxx_flags="${_base_cxxflags}"
fi

# ── Step 6: export ────────────────────────────────────────────────────────────

export KPORT_NEON_CMAKE_ARGS="$_neon_cmake_str"
export KPORT_NEON_CXX_FLAGS="$_neon_cxx_flags"
export KPORT_NEON_QT_PREFIX="$_qt_prefix"
export KPORT_NEON_KF_PREFIX="$_kf_prefix"
export KPORT_NEON_CHANNEL="$_NEON_CHANNEL"
export KPORT_NEON_BUILD_TYPE="$_build_type"

_ALL_VARS=(
  "KPORT_NEON_CMAKE_ARGS=${KPORT_NEON_CMAKE_ARGS}"
  "KPORT_NEON_CXX_FLAGS=${KPORT_NEON_CXX_FLAGS}"
  "KPORT_NEON_QT_PREFIX=${KPORT_NEON_QT_PREFIX}"
  "KPORT_NEON_KF_PREFIX=${KPORT_NEON_KF_PREFIX}"
  "KPORT_NEON_CHANNEL=${KPORT_NEON_CHANNEL}"
  "KPORT_NEON_BUILD_TYPE=${KPORT_NEON_BUILD_TYPE}"
)

case "$_OUTPUT_MODE" in
  export)
    for kv in "${_ALL_VARS[@]}"; do
      echo "$kv"
    done
    ;;
  json)
    python3 -c "
import json, sys
pairs = [line.split('=', 1) for line in sys.argv[1:]]
print(json.dumps({k: v for k, v in pairs}, indent=2))
" "${_ALL_VARS[@]}"
    ;;
  source)
    echo "[kport-neon-flags] Channel: ${KPORT_NEON_CHANNEL}  Build type: ${KPORT_NEON_BUILD_TYPE}" >&2
    echo "[kport-neon-flags] Qt prefix: ${KPORT_NEON_QT_PREFIX}" >&2
    echo "[kport-neon-flags] CMAKE_ARGS: ${KPORT_NEON_CMAKE_ARGS}" >&2
    ;;
esac
