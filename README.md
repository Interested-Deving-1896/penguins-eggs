[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool that enables users to create custom Linux distributions or live ISO images based on various Linux distributions, including Debian, Ubuntu, Arch, Fedora, and more. It is designed for system administrators, developers, and power users who need to create tailored operating system images for deployment or personal use.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project is organized into several key components that facilitate its functionality as a remaster system tool. The core logic is implemented in TypeScript, leveraging the `@oclif/core` framework for CLI functionality. The `bin/run.js` file serves as the entry point for the CLI. Dependencies include libraries for user interaction (`inquirer`, `chalk`, `ink`), system information retrieval (`systeminformation`, `linux-release-info`), and file handling (`js-yaml`, `mustache`). The project also integrates with external tools and services via `axios`, `helia`, and `tftp`.

The repository includes a set of GitHub workflows for CI/CD, documentation updates, artifact mirroring, and repository synchronization. These workflows are defined in the `.github/workflows` directory. The `integrations` directory contains custom modules for extending functionality. Configuration files for tools like ESLint, Prettier, and npm are located at the root level.

Directory structure:
```plaintext
.
├── bin/                  # CLI entry point
├── integrations/         # Custom integrations
├── .github/workflows/    # CI/CD workflows
├── src/                  # Source code
├── test/                 # Test files
├── CHANGELOG.md          # Changelog
├── LICENSE               # License file
├── README.md             # Project documentation
└── package.json          # Project metadata and dependencies
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
- **ci.yml**: Runs unit tests and linting for the project. No secrets required.
- **codeql.yml**: Performs static code analysis using GitHub's CodeQL. No secrets required.
- **release.yml**: Automates the release process, including version tagging and publishing. Requires `NPM_TOKEN` for publishing to npm.
- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` for authentication.
- **iso-test.yml**: Tests ISO builds for compatibility and functionality. No secrets required.
- **docs.yml**: Builds and deploys project documentation. Requires `DOCS_DEPLOY_KEY` for deployment.
- **sync-eggs-docs-to-book.yml**: Synchronizes documentation with an external book repository. Requires `SYNC_TOKEN`.
- **mirror-artifacts.yml**: Mirrors build artifacts to external storage. Requires `ARTIFACT_STORAGE_KEY`.
- **rate-limit-status.yml**: Monitors API rate limits and logs status. No secrets required.
- **rotate-token.yml**: Rotates API tokens for security. Requires `ADMIN_TOKEN` for token management.
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
[@monstermunchkin](https://github.com/monstermunchkin) - 818 commits  
[@stgraber](https://github.com/stgraber) - 785 commits  
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) - 332 commits  
[@itoffshore](https://github.com/itoffshore) - 155 commits  
[@pieroproietti](https://github.com/pieroproietti) - 56 commits  
[@ona-agent](https://github.com/ona-agent) - 50 commits  
[@simondeziel](https://github.com/simondeziel) - 32 commits  
[@nanjj](https://github.com/nanjj) - 23 commits  
[@masnax](https://github.com/masnax) - 16 commits  
[@brauner](https://github.com/brauner) - 13 commits  
[@mjrider](https://github.com/mjrider) - 11 commits  
[@tew42](https://github.com/tew42) - 10 commits  
[@ona-bot](https://github.com/ona-bot) - 9 commits  
[@chaosoffire](https://github.com/chaosoffire) - 9 commits  
[@stefanor](https://github.com/stefanor) - 6 commits  
[@rietbergenm](https://github.com/rietbergenm) - 5 commits  
[@Obirvalger](https://github.com/Obirvalger) - 5 commits  
[@nbuwe](https://github.com/nbuwe) - 5 commits  
[@adamcstephens](https://github.com/adamcstephens) - 5 commits  
[@gibmat](https://github.com/gibmat) - 5 commits  
[@hallyn](https://github.com/hallyn) - 5 commits  
[@dependabot[bot]](https://github.com/dependabot[bot]) - 4 commits  
[@web-flow](https://github.com/web-flow) - 4 commits  
[@geaaru](https://github.com/geaaru) - 4 commits  
[@eddyg](https://github.com/eddyg) - 3 commits  
[@tenforward](https://github.com/tenforward) - 3 commits  
[@marcosps](https://github.com/marcosps) - 3 commits  
[@stiltr](https://github.com/stiltr) - 3 commits  
[@timbretimber](https://github.com/timbretimber) - 3 commits  
[@foxtrotcz](https://github.com/foxtrotcz) - 3 commits  

*Note: This repository appears to be a mirror. Please refer to the upstream source for additional contributions and updates.*
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
