[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
This project provides a remastering tool for creating custom Linux distributions and live systems. It supports a wide range of Linux distributions, including Debian, Ubuntu, Arch, Fedora, and their derivatives. It is used by system administrators, developers, and enthusiasts to create tailored operating system images for deployment or personal use.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project consists of a modular architecture designed to facilitate system remastering across multiple Linux distributions. The core components include:

1. **CLI Tool**: The entry point is defined in `package.json` under the `bin` key, pointing to `./bin/run.js`. This CLI is built using the `@oclif/core` framework and provides commands for remastering tasks.
2. **Integrations**: Custom integrations are located in the `integrations` directory and are referenced as a local dependency in `package.json`.
3. **Frontend**: Built with `React` and `Ink`, the frontend provides a terminal-based user interface for interacting with the tool.
4. **Backend**: The backend leverages `Express` for API handling and `axios` for external HTTP requests. It also uses `systeminformation` for system-level data collection.
5. **Utilities**: Various utilities include YAML parsing (`js-yaml`), templating (`mustache`), and file system operations (`helia` and `@helia/unixfs`).

The directory structure is as follows:

```plaintext
.
├── bin/                 # CLI entry point
├── integrations/        # Custom integrations
├── src/                 # Source code
│   ├── commands/        # CLI commands
│   ├── components/      # React/Ink components
│   ├── utils/           # Utility functions
│   └── services/        # Backend services
├── workflows/           # CI/CD workflows
├── docs/                # Documentation files
├── tests/               # Test cases
└── package.json         # Project metadata and dependencies
```

Components interact through a combination of CLI commands, API endpoints, and shared utilities, enabling modularity and extensibility.
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
- **codeql.yml**: Performs CodeQL analysis to identify potential security vulnerabilities. Requires the `GH_TOKEN` secret for authentication.
- **release.yml**: Automates the release process, including version tagging and publishing artifacts. Requires `NPM_TOKEN` and `GH_TOKEN` secrets.
- **iso-test.yml**: Tests ISO builds for compatibility and functionality. No secrets required.
- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` secret.
- **cleanup-branches.yml**: Deletes stale branches in the repository. Requires `GH_TOKEN` secret.
- **sync-to-gitlab.yml**: Syncs repository changes to a GitLab mirror. Requires `GITLAB_TOKEN` secret.
- **update-readmes.yml**: Updates README files across repositories. No secrets required.
- **docs.yml**: Builds and deploys project documentation. Requires `GH_TOKEN` secret.
- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_TOKEN` secret.
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
