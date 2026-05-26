[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
This project provides a remastering tool for creating custom Linux distributions and live systems. It supports a wide range of Linux distributions, including Debian, Ubuntu, Arch, Fedora, and their derivatives. It is used by system administrators, developers, and enthusiasts to create tailored operating system images for deployment or personal use.
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
[@monstermunchkin](https://github.com/monstermunchkin) (818 commits)  
[@stgraber](https://github.com/stgraber) (785 commits)  
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) (296 commits)  
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

*This repository is a mirror. Please refer to the upstream source for additional contributions.*
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_Original project — no upstream fork._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
| File | Description |
|---|---|
| [config/gitlab-subgroups.yml](https://github.com/Interested-Deving-1896/penguins-eggs/blob/main/config/gitlab-subgroups.yml) | GitLab subgroup map |
<!-- AI:end:resources -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
