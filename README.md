[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool that enables users to create custom Linux distributions or live ISO images based on various Linux distributions, including Debian, Ubuntu, Arch, Fedora, and others. It is designed for system administrators, developers, and advanced users who need to customize and redistribute Linux environments for specific use cases.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The architecture consists of a CLI tool built with TypeScript, leveraging the oclif framework for command-line interfaces. It supports remastering Linux distributions and integrates with various system utilities and libraries. Key components include:

1. **CLI Commands**: Defined in the `bin/run.js` entry point, powered by oclif plugins for autocomplete, help, and versioning.
2. **System Utilities**: Dependencies like `systeminformation`, `linux-release-info`, and `tftp` handle system-level operations.
3. **Rendering and Interaction**: Uses `ink` and `inquirer` for interactive terminal UIs, with additional libraries for progress bars and spinners.
4. **Configuration and Templates**: Managed using `js-yaml` and `mustache`.
5. **Custom Integrations**: Located in the `integrations` directory, providing project-specific extensions.
6. **Workflows**: GitHub Actions YAML files automate CI/CD, repository synchronization, and artifact management.

Directory structure:
```plaintext
├── bin/                # CLI entry point and command definitions
├── integrations/       # Custom integrations for specific distributions
├── .github/workflows/  # CI/CD workflow definitions
├── docs/               # Documentation files
├── src/                # Source code for core functionality
├── test/               # Test cases and utilities
├── package.json        # Project metadata and dependencies
└── README.md           # Project documentation
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
- **codeql.yml**: Performs static code analysis using GitHub CodeQL for security vulnerabilities. No secrets required.
- **release.yml**: Automates the release process, including version tagging and publishing. Requires `NPM_TOKEN` for publishing to npm.
- **docs.yml**: Builds and deploys documentation to the specified hosting service. Requires `GH_PAGES_TOKEN` for GitHub Pages deployment.
- **iso-test.yml**: Tests ISO builds for compatibility and functionality. No secrets required.
- **mirror.yaml**: Mirrors the repository to external services. Requires `MIRROR_TOKEN` for authentication.
- **cleanup-branches.yml**: Deletes stale branches from the repository. No secrets required.
- **sync-to-gitlab.yml**: Syncs repository changes to GitLab. Requires `GITLAB_TOKEN` for authentication.
- **rotate-token.yml**: Rotates API tokens used in workflows. Requires `ADMIN_TOKEN` for token management.
- **trigger-artifact-mirror.yml**: Triggers artifact mirroring workflows. No secrets required.
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
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) - 311 commits  
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

*Note: This repository may be a mirror. Please check the [upstream source](https://github.com/Interested-Deving-1896/penguins-eggs) for more details.*
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
