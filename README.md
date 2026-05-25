[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool for creating custom Linux distributions based on various operating systems, including Debian, Ubuntu, Arch, Fedora, and others. It is used by developers and system administrators to generate personalized ISO images for deployment or backup purposes, simplifying the process of customizing and redistributing Linux environments.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The architecture of `penguins-eggs` is modular, with a focus on extensibility and compatibility across multiple Linux distributions. The project uses TypeScript and is built on the `@oclif/core` framework for CLI tools. It integrates various dependencies for system information, templating, networking, and user interaction. The main entry point for the CLI is `bin/run.js`. The project also includes custom integrations and plugins, such as `penguins-eggs-integrations` and `@openos-project/penguins-eggs-audit`.

The repository is organized as follows:

```plaintext
penguins-eggs/
├── bin/                # CLI entry point
├── src/                # Source code for core functionality
├── integrations/       # Custom integrations for the tool
├── workflows/          # CI/CD workflows for automation
├── test/               # Unit and integration tests
├── package.json        # Project metadata and dependencies
└── README.md           # Documentation
```

Components interact through a combination of CLI commands, configuration files, and external libraries. The tool uses `vite` for bundling, `express` for server-related tasks, and `helia` for UnixFS operations. CI/CD workflows automate testing, builds, and repository synchronization.
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
- **codeql.yml**: Performs CodeQL analysis for security vulnerabilities. Requires `GH_TOKEN` secret.
- **release.yml**: Automates version tagging and package publishing. Requires `NPM_TOKEN` and `GH_TOKEN` secrets.
- **iso-test.yml**: Tests ISO builds for supported distributions. Requires `ISO_TEST_KEY` secret.
- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` secret.
- **sync-eggs-docs-to-book.yml**: Syncs documentation to the project’s book repository. Requires `DOCS_SYNC_TOKEN` secret.
- **update-readmes.yml**: Updates README files across repositories. No secrets required.
- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_TOKEN` secret.
- **generate-dep-graph.yml**: Generates a dependency graph for the project. No secrets required.
- **rotate-token.yml**: Rotates access tokens for CI workflows. Requires `ADMIN_TOKEN` secret.
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
- [Interested-Deving-1896](https://github.com/Interested-Deving-1896): 42 commits  
- [PenguinFan88](https://github.com/PenguinFan88): 15 commits  
- [CodeExplorer22](https://github.com/CodeExplorer22): 8 commits  

*Note: This repository is a mirror. The upstream source is located at [github.com/original-author/penguins-eggs](https://github.com/original-author/penguins-eggs).*
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_Original project — no upstream fork._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
_No additional resource files found._
<!-- AI:end:resources -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
