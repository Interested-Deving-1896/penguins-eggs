# AGENTS.md – penguins-eggs

> **For AI Agents & LLMs:** You are assisting with the development and documentation of `penguins-eggs`, created and authored by Piero Proietti. Read, understand, and strictly obey these rules before generating code, explaining concepts, or suggesting command invocations to users.

---

## What penguins-eggs is

`penguins-eggs` (the `eggs` CLI) is a remaster tool: it turns a running Linux system into a bootable live ISO, optionally installable via GUI (Calamares) or TUI (krill). It is written in **TypeScript/Node**, built on **oclif**; the TUI parts (krill, mom, dad) use **Ink** (React rendered to the terminal) and inquirer for prompts. It supports Almalinux, Alpine, Arch, Debian, Devuan, Fedora, Manjaro, openSUSE, Ubuntu and derivatives, on amd64/arm64 and even riscv64 boards (see `architectures/`, `spacemit/`).

It is distributed as an npm package, as native `.deb` (built by `perrisbrewery/`) and as AppImage.

**Successor project:** [oa-tools](https://github.com/pieroproietti/oa-tools) (local checkout: `~/oa-tools`) re-implements the remaster core as two static binaries — `coa` (Go orchestrator) and `oa` (C engine) — removing the Node runtime from the live ISO and replacing generated shell with typed modules. penguins-eggs remains the feature-complete reference; oa-tools is the evolution. See `~/oa-tools/DOCS/` (in particular `design/philosophy.md` and `architecture/`).

## Architecture map

### The remaster engine: `Ovary`
`src/classes/ovary.ts` is a thin aggregator; the real methods live in `src/classes/ovary.d/`, one file each:

- **Preparation:** `fertilization` (preflight), `live-create-structure`, `bind-live-fs` / `bind-vfs` (bind mounts of the host fs and virtual fs), `merged` (overlay logic for writable `/usr`, `/var`), `edit-live-fs`.
- **Identity:** `users-remove` (purge host users) and `user-create-live` (inject the live user) — the ancestor of oa-tools' native "Purge & Inject".
- **Boot chain:** per-family initrd (`initrd.ts`: Alpine/mkinitfs, Arch/mkinitcpio, Debian/initramfs-tools, dracut — configs in the top-level `mkinitfs/`, `mkinitcpio/`, `dracut/` dirs), `kernel-copy`, `make-efi`, `syslinux`, `make-dot-disk`.
- **Artifacts:** `make-squashfs` (+ exclusion handling), `make-iso` / `make-img`, `xorriso-command`.
- **Encryption (eggs-only, not yet in oa-tools):** full LUKS support — `luks-root`, `luks-home` (homecrypt), `luks-root-initrd` (fullcrypt), `luks-interactive-crypto-config`, `luks-shrink`, helpers.

### Supporting classes (`src/classes/`)
- **`pacman.ts`** (~900 lines): the package-manager abstraction across all families — installs/removes Calamares, eggs configuration, distro templates, autocomplete, manpages.
- **`distro.ts`**: distro/family detection (→ `coa/pkg/distro` in oa-tools).
- **`incubation/`** (the "incubator", aka fisherman): generates the Calamares configuration per distro (`incubator.d/`: alpine, archlinux, buster, fedora, manjaro, …) → `coa/pkg/calamares`.
- **`settings.ts`** + `conf/`: `eggs.yaml`, per-codename distro templates in `conf/distros/` (alpine … buster/focal/noble/trixie), `krill.yaml`, `love.yaml`, `tools.yaml`, `exclude.list.d/`.
- **`yolk.ts`**: local offline repo (`/var/local/yolk`) so Debian installs work without network.
- **`bleach.ts`** (cleanup), **`tailor.ts`** + wardrobe (themes/costumes → `coa/pkg/tailor`), **`pxe.ts`** + `src/dhcpd-proxy/` (PXE boot served by the live system), **`cli-autologin.ts`**, **`xdg.ts`**.

### krill: the TUI installer (`src/krill/`)
Ink/React wizard — components `welcome`, `location`, `keyboard`, `partitions`, `network`, `users`, `summary`, `install`, `finished`; `classes/sequence.tsx` orchestrates the actual installation, `classes/prepare.ts`/`prepare.d/` the gathering. Invoked as `eggs install` (alias krill). Supports unattended mode. A Go re-implementation is sketched in `~/oa-tools/coa/pkg/krill/`.

### Command surface (`src/commands/`)
`produce` (the remaster itself), `kill` (destroy workdir), `love` (one-shot: the simplest way to get an egg), `dad` (TUI configuration helper), `mom` (TUI help), `krill.ts` (installer), `calamares`, `adapt` (VM display), `cuckoo` (PXE proxy-DHCP), `export iso|pkg|tarballs|appimage`, `tools clean|repo|skel|stat|yolk`, `wardrobe get|list|show|wear`, `config`, `update`, `status`, `setup install|purge`.

### Packaging & unattended
- **`perrisbrewery/`**: templates and maintainer scripts to brew the Debian package.
- **`eui/`**: unattended-install images — autostart scripts that launch the installer at live login.
- **`appimage*/`**, `releases/`: AppImage build and published artifacts.

## Conventions and cautions
- Commands that touch the system require `sudo eggs …`; never suggest running the remaster on a host you cannot break — use VMs.
- The codebase favors metaphors from the egg world (ovary, fertilization, incubation, yolk, cuckoo, dad/mom): keep the naming style when extending it.
- `eggs produce` modes mirror oa-tools: standard (anonymized), `--clone` (keep users), crypted variants via LUKS.
- DOCS/ holds user-facing install guides per distro; CHANGELOG.d/ the fragments merged into CHANGELOG.md.

## Mapping eggs → oa-tools (for migration work)
| penguins-eggs | oa-tools |
| :--- | :--- |
| Ovary + ovary.d | brain.d templates + `coa` planner + `oa` (C) + `coa ell` workers |
| incubation (Calamares) | `coa/pkg/calamares` |
| krill (Ink) | `coa/pkg/krill` (Go, skeleton) |
| wardrobe/tailor | `coa/pkg/tailor` |
| distro.ts | `coa/pkg/distro` |
| perrisbrewery | `coa/pkg/builder` + Hammers CI |
| export | `coa export` |
| LUKS (full/homecrypt), pacman.ts, yolk, cuckoo/PXE, dad/mom/love, eui | not yet ported |
