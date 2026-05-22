# neon-channels.conf.tpl — KDE Neon channel configuration template
#
# Defines the three KDE Neon channels and their apt/metadata properties.
# Used by kport-neon-env.sh to configure build environments and by
# neon-build-ci.yml to parameterise CI matrix jobs.
#
# This file is managed by fork-sync-all/propagate-hw-detect.
# Do not edit manually — changes will be overwritten on next sync.
# Source: https://github.com/Interested-Deving-1896/KPort

# ── Channel definitions ───────────────────────────────────────────────────────
#
# Format: CHANNEL_<NAME>_<PROPERTY>=<value>
#
# Properties:
#   URL          — base apt repository URL
#   SUITE_NOBLE  — apt suite for Ubuntu 24.04 (noble)
#   SUITE_JAMMY  — apt suite for Ubuntu 22.04 (jammy)
#   SIGNING_KEY  — URL of the apt signing key
#   STABILITY    — production | pre-release | snapshot
#   CI_REQUIRED  — true if CI must pass against this channel before merge

CHANNEL_STABLE_URL=https://archive.neon.kde.org/user
CHANNEL_STABLE_SUITE_NOBLE=noble
CHANNEL_STABLE_SUITE_JAMMY=jammy
CHANNEL_STABLE_SIGNING_KEY=https://archive.neon.kde.org/public.key
CHANNEL_STABLE_STABILITY=production
CHANNEL_STABLE_CI_REQUIRED=true

CHANNEL_UNSTABLE_URL=https://archive.neon.kde.org/unstable
CHANNEL_UNSTABLE_SUITE_NOBLE=noble
CHANNEL_UNSTABLE_SUITE_JAMMY=jammy
CHANNEL_UNSTABLE_SIGNING_KEY=https://archive.neon.kde.org/public.key
CHANNEL_UNSTABLE_STABILITY=pre-release
CHANNEL_UNSTABLE_CI_REQUIRED=true

CHANNEL_NIGHTLY_URL=https://archive.neon.kde.org/testing
CHANNEL_NIGHTLY_SUITE_NOBLE=noble
CHANNEL_NIGHTLY_SUITE_JAMMY=jammy
CHANNEL_NIGHTLY_SIGNING_KEY=https://archive.neon.kde.org/public.key
CHANNEL_NIGHTLY_STABILITY=snapshot
CHANNEL_NIGHTLY_CI_REQUIRED=false

# ── Supported Ubuntu suites ───────────────────────────────────────────────────

NEON_SUPPORTED_SUITES=noble jammy

# ── Default channel for new consumers ────────────────────────────────────────

NEON_DEFAULT_CHANNEL=stable

# ── Minimum Qt/KF versions required by KPort packages ────────────────────────
# Used by kport-neon-flags.sh as cmake version guards.

NEON_MIN_QT_VERSION=6.6.0
NEON_MIN_KF_VERSION=6.0.0
NEON_MIN_PLASMA_VERSION=6.0.0
