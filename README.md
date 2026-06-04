[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool that allows users to create custom Linux distributions based on various operating systems, including Debian, Ubuntu, Arch, Fedora, and more. It is designed for system administrators, developers, and enthusiasts who need to build and distribute tailored Linux environments.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The architecture of `penguins-eggs` is modular, designed to facilitate system remastering across multiple Linux distributions. The project is implemented in TypeScript and uses the oclif framework for CLI functionality. Key components include:

1. **CLI Interface**: The entry point (`bin/run.js`) provides command-line utilities for interacting with the tool.
2. **Core Logic**: The main functionality is implemented in TypeScript, leveraging dependencies like `@oclif/core`, `axios`, `chalk`, and `mustache` for CLI operations, HTTP requests, output formatting, and templating.
3. **Integrations**: The `integrations` directory contains custom modules for distribution-specific operations.
4. **Workflows**: GitHub Actions workflows automate CI/CD, repository synchronization, artifact mirroring, and documentation updates.
5. **Configuration Files**: Various configuration files (e.g., `.prettierrc`, `.editorconfig`, `.yamllint.yaml`) ensure consistent coding standards and build processes.

Directory structure:
```plaintext
.
├── bin/                 # CLI entry point
├── src/                 # Source code (TypeScript)
├── integrations/        # Distribution-specific integrations
├── .github/workflows/   # CI/CD workflows
├── docs/                # Documentation files
├── tests/               # Test cases
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
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
- **ci.yml**: Runs the main continuous integration pipeline, including linting, testing, and building the project. No secrets required.

- **codeql.yml**: Performs static code analysis using GitHub's CodeQL to identify vulnerabilities. No secrets required.

- **release.yml**: Automates the release process, including version tagging and publishing. Requires `NPM_TOKEN` for publishing to npm.

- **iso-test.yml**: Tests the ISO generation process for supported distributions. No secrets required.

- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` for authentication.

- **docs.yml**: Builds and deploys project documentation. Requires `DOCS_DEPLOY_KEY` for deployment.

- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_TOKEN` for access.

- **sync-eggs-docs-to-book.yml**: Synchronizes documentation with the book repository. Requires `BOOK_SYNC_TOKEN`.

- **rotate-token.yml**: Rotates API tokens used in workflows. Requires `ADMIN_TOKEN` for token management.

- **validate-config.yml**: Validates configuration files for syntax and consistency. No secrets required.
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
