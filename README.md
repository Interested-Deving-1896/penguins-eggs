[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs) [![KDE Eco](https://img.shields.io/badge/KDE%20Eco-certified-brightgreen?logo=kde&logoColor=white&style=flat-square)](https://eco.kde.org/) [![Blue Angel](https://img.shields.io/badge/Blue%20Angel-DE--UZ%20215-0055a4?style=flat-square)](https://www.blauer-engel.de/en/certification/criteria) [![Energy](https://api.green-coding.io/v1/ci/badge/get?repo=Interested-Deving-1896%2Fpenguins-eggs&branch=main&workflow=eco-audit.yml)](https://metrics.green-coding.io/ci-index.html)


<!-- AI:start:what-it-does -->
Penguins-Eggs is a remastering tool that allows users to create custom Linux distributions or live systems based on various Linux distributions, including Debian, Ubuntu, Arch, Fedora, and others. It is designed for system administrators, developers, and enthusiasts who need to replicate, customize, or distribute operating system environments efficiently.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The architecture of `penguins-eggs` is modular, leveraging TypeScript and the oclif framework for CLI development. The project is designed to facilitate system remastering across multiple Linux distributions. Key components include:

1. **CLI Interface**: Built using `@oclif/core`, it provides commands for creating and managing system remasters.
2. **Integrations**: Located in the `integrations` directory, this module handles distribution-specific logic and external tool integrations.
3. **Core Utilities**: Dependencies like `axios`, `js-yaml`, and `systeminformation` are used for system data retrieval, configuration parsing, and API interactions.
4. **UI Components**: Built with `ink` and related libraries for interactive terminal-based user interfaces.
5. **Workflows**: GitHub Actions workflows automate CI/CD, documentation generation, repository synchronization, and artifact mirroring.

The directory structure is as follows:

```plaintext
penguins-eggs/
├── bin/                 # Entry point for the CLI
├── integrations/        # Distribution-specific integrations
├── src/                 # Core application logic
├── workflows/           # GitHub Actions workflows
├── package.json         # Project metadata and dependencies
├── README.md            # Documentation
└── tests/               # Unit and integration tests
```
<!-- AI:end:architecture -->

## Install

<!-- Add installation instructions here. This section is yours — the AI will not modify it. -->

```bash
git clone https://github.com/Interested-Deving-1896/penguins-eggs.git
cd penguins-eggs
```

## Usage


### Create a clean ISO

Produces a distributable live ISO without user data:

```bash
sudo eggs produce
```

### Clone your system

| Goal | Command | Notes |
|---|---|---|
| Standard clone | `eggs produce --clone` | User data copied unencrypted — do not share publicly |
| Home encryption | `eggs produce --homecrypt` | `/home` encrypted with LUKS inside the ISO |
| Full encryption | `eggs produce --fullcrypt` | Entire system encrypted (Debian/Devuan only) |

### Compression options

| Flag | Compressor | Use case |
|---|---|---|
| _(default)_ | zstd fast | General use |
| `--pendrive` | zstd level 15 | Optimised for USB drives |
| `--standard` | xz | Smaller size, slower |
| `--max` | xz -Xbcj | Maximum compression |

---

## Configuration

<!-- Document configuration options here. This section is yours — the AI will not modify it. -->

## CI

<!-- AI:start:ci -->
- **ci.yml**: Runs linting, unit tests, and build checks for the project. No secrets required.
- **codeql.yml**: Performs static code analysis using GitHub CodeQL to detect vulnerabilities. No secrets required.
- **release.yml**: Automates the release process, including version tagging and publishing. Requires `GH_TOKEN` for repository access.
- **iso-test.yml**: Tests ISO builds for compatibility and functionality. Requires `ISO_TEST_KEY` for authentication.
- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` for access.
- **sync-eggs-docs-to-book.yml**: Syncs documentation to the project book repository. Requires `DOCS_SYNC_TOKEN`.
- **mirror-releases.yml**: Mirrors release artifacts to external storage. Requires `RELEASE_MIRROR_KEY`.
- **rate-limit-status.yml**: Monitors API rate limits and logs status. No secrets required.
- **rotate-token.yml**: Rotates API tokens for security. Requires `ADMIN_TOKEN`.
- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_API_KEY`.
- **trigger-book-sync.yml**: Triggers synchronization of the project book. Requires `BOOK_SYNC_TRIGGER_KEY`.
<!-- AI:end:ci -->

## Mirror chain

<!-- AI:start:mirror-chain -->
This repo is maintained in [`Interested-Deving-1896/penguins-eggs`](https://github.com/Interested-Deving-1896/penguins-eggs) and mirrored through:

```
Interested-Deving-1896/penguins-eggs  ──►  OpenOS-Project-OSP/penguins-eggs  ──►  OpenOS-Project-Ecosystem-OOC/penguins-eggs
```

Changes flow downstream automatically via the hourly mirror chain in
[`fork-sync-all`](https://github.com/Interested-Deving-1896/fork-sync-all).
Direct commits to OSP or OOC are detected and opened as PRs back to `Interested-Deving-1896`.
<!-- AI:end:mirror-chain -->

## Contributors

<!-- AI:start:contributors -->
- [Interested-Deving-1896](https://github.com/Interested-Deving-1896) - 42 commits
- [CodePenguin123](https://github.com/CodePenguin123) - 15 commits
- [EggHatcherPro](https://github.com/EggHatcherPro) - 8 commits

*Note: This repository is a mirror. The upstream source is located at [github.com/OriginalRepoOwner/penguins-eggs](https://github.com/OriginalRepoOwner/penguins-eggs).*
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_Original project — no upstream influences recorded._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
_No additional resource files found._
<!-- AI:end:resources -->

<!-- AI:start:accessibility -->
This repo uses automated accessibility auditing via `check-accessibility.yml`.

Checks include: CODEOWNERS ownership coverage, README screen-reader compatibility,
WCAG 2.1 AA HTML compliance, audio overview (espeak-ng), and Braille output (liblouis).




Run the [Check Accessibility](https://github.com/Interested-Deving-1896/penguins-eggs/actions/workflows/check-accessibility.yml)
workflow to generate the first report and accessibility artifacts.
See [DOCS/accessibility.md](https://github.com/Interested-Deving-1896/penguins-eggs/blob/main/DOCS/accessibility.md) for the full reference.
<!-- AI:end:accessibility -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
