[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool for creating custom Linux distributions based on various operating systems, including Debian, Ubuntu, Arch, Fedora, and others. It is designed for developers and system administrators who need to create and distribute tailored Linux images for specific use cases or environments.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project is structured as a CLI tool implemented in TypeScript, designed for creating system remasters across various Linux distributions. It uses the [oclif](https://oclif.io/) framework for command-line interface functionality and integrates with multiple libraries for system information, templating, and network operations. Key components include:

1. **CLI Commands**: Defined in the `bin/run.js` file, leveraging `@oclif/core` for command parsing and execution.
2. **Integrations**: Custom integrations are located in the `integrations` directory and are included as a local dependency.
3. **Workflows**: GitHub Actions workflows automate tasks like CI/CD, repository synchronization, and artifact management.
4. **Dependencies**: The project uses libraries such as `express` for HTTP handling, `js-yaml` for configuration parsing, and `systeminformation` for system-level data.

The directory structure is as follows:

```plaintext
.
├── bin/                  # Entry point for CLI commands
├── integrations/         # Custom integrations
├── workflows/            # GitHub Actions workflows
├── src/                  # Source code
├── test/                 # Test files
├── .github/              # GitHub configuration
├── .vscode/              # VSCode settings
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
- **ci.yml**: Runs the main CI pipeline, including linting, testing, and build tasks. No secrets required.
- **codeql.yml**: Performs CodeQL analysis for security vulnerabilities. Requires `GH_TOKEN` secret.
- **release.yml**: Automates the release process, including version tagging and publishing. Requires `NPM_TOKEN` and `GH_TOKEN` secrets.
- **iso-test.yml**: Tests ISO builds for supported distributions. No secrets required.
- **mirror.yaml**: Mirrors the repository to other platforms. Requires `MIRROR_GITLAB_TOKEN` secret.
- **sync-eggs-docs-to-book.yml**: Syncs documentation to the book repository. Requires `GH_TOKEN` secret.
- **mirror-releases.yml**: Mirrors release assets to external storage. Requires `STORAGE_ACCESS_KEY` and `STORAGE_SECRET_KEY` secrets.
- **frogbot-scan.yml**: Runs dependency vulnerability scans using Frogbot. Requires `JFROG_API_KEY` secret.
- **rate-limit-status.yml**: Monitors and reports GitHub API rate limits. No secrets required.
- **rotate-token.yml**: Rotates API tokens for security. Requires `ADMIN_TOKEN` secret.
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
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) (335 commits)  
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

*Note: This repository may be a mirror. Please check the [upstream source](https://github.com/Interested-Deving-1896/penguins-eggs) for additional context.*
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
