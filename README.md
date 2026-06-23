[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool designed to create custom Linux distributions and live ISO images. It supports a wide range of Linux distributions, including Debian, Ubuntu, Arch, Fedora, and their derivatives. It is used by developers, system administrators, and Linux enthusiasts to build and distribute tailored operating system images for specific use cases.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project consists of a modular architecture designed to facilitate system remastering across multiple Linux distributions. The core components include:

1. **CLI Tool**: The entry point (`bin/run.js`) provides a command-line interface built using the `@oclif/core` framework.
2. **Integrations**: Located in the `integrations` directory, this module handles distribution-specific logic and external tool integrations.
3. **Configuration and Templates**: YAML and Mustache are used for configuration and templating, enabling customization of remastering workflows.
4. **System Utilities**: Dependencies like `systeminformation` and `linux-release-info` gather system metadata, while `tftp` and `axios` manage file transfers and HTTP requests.
5. **UI Components**: Built with `ink` and related libraries, providing interactive terminal-based user interfaces.
6. **Workflows**: GitHub Actions workflows automate CI/CD, repository synchronization, and artifact management.

The directory structure is as follows:

```plaintext
.
├── bin/                 # CLI entry point
├── integrations/        # Distribution-specific integrations
├── workflows/           # GitHub Actions workflows
├── .github/             # GitHub configuration files
├── DOCS/                # Documentation files
├── LICENSE              # License file
├── README.md            # Project documentation
├── package.json         # Project metadata and dependencies
└── src/                 # Source code for core functionality
```

Components interact through a combination of CLI commands, configuration files, and external APIs, enabling flexible and extensible remastering processes.
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
- **`ci.yml`**: Runs the main CI pipeline, including linting, testing, and building the project. No secrets required.
- **`codeql.yml`**: Performs static code analysis using GitHub's CodeQL to identify potential security vulnerabilities. No secrets required.
- **`release.yml`**: Automates the release process, including version tagging and publishing artifacts. Requires `NPM_TOKEN` for publishing to npm.
- **`iso-test.yml`**: Tests ISO builds for supported Linux distributions. No secrets required.
- **`mirror.yaml`**: Mirrors the repository to other platforms. Requires `MIRROR_TOKEN` for authentication.
- **`mirror-releases.yml`**: Syncs release artifacts to external repositories. Requires `MIRROR_TOKEN`.
- **`sync-eggs-docs-to-book.yml`**: Synchronizes documentation to the project book repository. Requires `DOCS_SYNC_TOKEN`.
- **`rotate-token.yml`**: Rotates access tokens used in workflows. Requires `ADMIN_TOKEN`.
- **`rate-limit-status.yml`**: Monitors API rate limits for external services. No secrets required.
- **`frogbot-scan.yml`**: Runs dependency vulnerability scans using Frogbot. Requires `JFROG_API_KEY`.
- **`trigger-artifact-mirror.yml`**: Triggers artifact mirroring workflows. Requires `MIRROR_TRIGGER_TOKEN`.
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
[@monstermunchkin](https://github.com/monstermunchkin) (818 commits)  
[@stgraber](https://github.com/stgraber) (785 commits)  
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) (342 commits)  
[@itoffshore](https://github.com/itoffshore) (155 commits)  
[@pieroproietti](https://github.com/pieroproietti) (56 commits)  
[@ona-agent](https://github.com/ona-agent) (50 commits)  
[@simondeziel](https://github.com/simondeziel) (32 commits)  
[@nanjj](https://github.com/nanjj) (23 commits)  
[@masnax](https://github.com/masnax) (16 commits)  
[@brauner](https://github.com/brauner) (13 commits)  
[@mjrider](https://github.com/mjrider) (11 commits)  
[@tew42](https://github.com/tew42) (10 commits)  
[@ona-bot](https://github.com/ona-bot) (9 commits)  
[@chaosoffire](https://github.com/chaosoffire) (9 commits)  
[@stefanor](https://github.com/stefanor) (6 commits)  
[@rietbergenm](https://github.com/rietbergenm) (5 commits)  
[@Obirvalger](https://github.com/Obirvalger) (5 commits)  
[@nbuwe](https://github.com/nbuwe) (5 commits)  
[@adamcstephens](https://github.com/adamcstephens) (5 commits)  
[@gibmat](https://github.com/gibmat) (5 commits)  
[@hallyn](https://github.com/hallyn) (5 commits)  
[@dependabot[bot]](https://github.com/dependabot[bot]) (4 commits)  
[@web-flow](https://github.com/web-flow) (4 commits)  
[@geaaru](https://github.com/geaaru) (4 commits)  
[@eddyg](https://github.com/eddyg) (3 commits)  
[@tenforward](https://github.com/tenforward) (3 commits)  
[@marcosps](https://github.com/marcosps) (3 commits)  
[@stiltr](https://github.com/stiltr) (3 commits)  
[@timbretimber](https://github.com/timbretimber) (3 commits)  
[@foxtrotcz](https://github.com/foxtrotcz) (3 commits)  

*Note: This repository may be a mirror. Please refer to the upstream source for the original contributions.*
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
