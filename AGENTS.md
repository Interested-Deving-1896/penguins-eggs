# AGENTS.md – penguins-eggs-legacy

> **For AI Agents, LLMs & Developers:** You are working on **`penguins-eggs-legacy`**, the historical TypeScript/Node.js implementation of `penguins-eggs`, created and authored by Piero Proietti. Read, understand, and follow these rules before generating code, explaining concepts, or suggesting command invocations.

---

## ⚠️ Legacy Notice & Transition Recommendation

> [!IMPORTANT]
> **This repository is `penguins-eggs-legacy`.**
> Active development and the next generation of the project have transitioned to the new **[penguins-eggs](https://github.com/pieroproietti/penguins-eggs)** based on **C and Go** (`oa` engine + `coa` orchestrator).
>
> **Recommendation:**
> - For new live remastering workflows, production deployments, and core contributions, **switch to the new C and Go version of penguins-eggs**.
> - The new C/Go architecture replaces the Node.js runtime and shell invocations with a high-performance C native engine (`oa`) using direct Linux kernel syscalls and an intelligent Go orchestrator (`coa`), delivering significantly faster builds, zero runtime bloat in the ISO, and clean modularity.
> - This legacy repository remains as the **feature-complete reference implementation** and for legacy maintenance.

---

## What penguins-eggs-legacy is

`penguins-eggs-legacy` (invoked via `eggs-legacy` or legacy `eggs` CLI) is the comprehensive remaster tool that turns a running Linux system into a bootable live ISO, installable via GUI (Calamares) or TUI (krill).

- **Stack:** Written in **TypeScript / Node.js**, built on **oclif** CLI framework; TUI wizards (`krill`, `mom`, `dad`) use **Ink** (React rendered in the terminal) and Inquirer for prompts.
- **Distro support:** Almalinux, Alpine, Arch, Debian, Devuan, Fedora, Manjaro, openSUSE, Ubuntu and derivatives.
- **Architectures:** amd64, arm64, armel, armhf, and riscv64 boards (see `architectures/`, `spacemit/`).
- **Distribution formats:** npm package, native `.deb` (built by `perrisbrewery/`), and AppImage.

---

## Architecture Map

### The Remaster Engine: `Ovary`
`src/classes/ovary.ts` is a thin aggregator; the real methods live in `src/classes/ovary.d/`, one file each:

- **Preparation:** `fertilization` (preflight), `live-create-structure`, `bind-live-fs` / `bind-vfs` (bind mounts of host fs and virtual fs), `merged` (overlay logic for writable `/usr`, `/var`), `edit-live-fs`.
- **Identity:** `users-remove` (purge host users) and `user-create-live` (inject the live user) — the ancestor of the new C/Go native "Purge & Inject".
- **Boot chain:** per-family initrd (`initrd.ts`: Alpine/`mkinitfs`, Arch/`mkinitcpio`, Debian/`initramfs-tools`, Fedora/openSUSE/`dracut` — configs in the top-level `mkinitfs/`, `mkinitcpio/`, `dracut/` dirs), `kernel-copy`, `make-efi`, `syslinux`, `make-dot-disk`.
- **Artifacts:** `make-squashfs` (+ exclusion handling), `make-iso` / `make-img`, `xorriso-command`.
- **Encryption (legacy reference):** full LUKS support — `luks-root`, `luks-home` (homecrypt), `luks-root-initrd` (fullcrypt), `luks-interactive-crypto-config`, `luks-shrink`, helpers.

### Supporting Classes (`src/classes/`)
- **`pacman.ts`** (~900 lines): the package-manager abstraction across all families — installs/removes Calamares, eggs configuration, distro templates, autocomplete, manpages.
- **`distro.ts`**: distro/family detection (→ `coa/pkg/distro` in the C/Go version).
- **`incubation/`** (the "incubator", aka fisherman): generates the Calamares configuration per distro (`incubator.d/`: alpine, archlinux, buster, fedora, manjaro, …) → `coa/pkg/calamares`.
- **`settings.ts`** + `conf/`: `eggs.yaml`, per-codename distro templates in `conf/distros/` (alpine … buster/focal/noble/trixie), `krill.yaml`, `love.yaml`, `tools.yaml`, `exclude.list.d/`.
- **`yolk.ts`**: local offline repo (`/var/local/yolk`) so Debian installs work without network.
- **`bleach.ts`** (cleanup), **`pxe.ts`** + `src/dhcpd-proxy/` (PXE boot served by the live system), **`cli-autologin.ts`**, **`xdg.ts`**.

### Krill: the TUI Installer (`src/krill/`)
Ink/React wizard — components `welcome`, `location`, `keyboard`, `partitions`, `network`, `users`, `summary`, `install`, `finished`; `classes/sequence.tsx` orchestrates the actual installation, `classes/prepare.ts`/`prepare.d/` the gathering. Invoked as `eggs install` (alias krill). Supports unattended mode.

### Command Surface (`src/commands/`)
`produce` (the remaster itself), `kill` (destroy workdir), `love` (one-shot: the simplest way to get an egg), `dad` (TUI configuration helper), `mom` (TUI help), `krill.ts` (installer), `calamares`, `adapt` (VM display), `cuckoo` (PXE proxy-DHCP), `export iso|pkg|tarballs|appimage`, `tools clean|repo|skel|stat|yolk`, `config`, `update`, `status`, `setup install|purge`.

### Packaging & Unattended
- **`perrisbrewery/`**: templates and maintainer scripts to brew the Debian package.
- **`eui/`**: unattended-install images — autostart scripts that launch the installer at live login.
- **`appimage*/`**, `releases/`: AppImage build and published artifacts.

---

## Conventions and Cautions
- Commands that touch the system require `sudo eggs-legacy …` (or `sudo eggs …`); never suggest running the remaster on a host you cannot break — use VMs.
- The codebase favors metaphors from the egg world (`ovary`, `fertilization`, `incubation`, `yolk`, `cuckoo`, `dad`/`mom`): keep the naming style when extending or documenting legacy features.
- `eggs produce` modes: standard (anonymized), `--clone` (keep users), crypted variants via LUKS.
- `DOCS/` holds user-facing install guides per distro; `CHANGELOG.d/` the fragments merged into `CHANGELOG.md`.

---

## Mapping: `penguins-eggs-legacy` → `penguins-eggs` (C & Go)

| penguins-eggs-legacy (TypeScript/Node) | New penguins-eggs (C + Go) | Status in New Architecture |
| :--- | :--- | :--- |
| `Ovary` + `ovary.d/` | `coa` planner + `oa` (C engine) + `brain.d` | Native syscalls & zero-copy engine |
| `incubation/` (Calamares) | `coa/pkg/calamares` | Migrated to typed Go modules |
| `krill` (Ink/React) | `coa/pkg/krill` | Re-implemented in Go |
| `wardrobe` / `tailor.ts` | `coa/pkg/tailor` | Go costume & theme engine |
| `distro.ts` | `coa/pkg/distro` | Native Go distro detection |
| `perrisbrewery/` | `coa/pkg/builder` + Hammers CI | Automated Go builder |
| `export` | `coa export` | Native export tool |
| LUKS (full/homecrypt) | *Planned / in progress* | Reference `src/classes/ovary.d/luks-*` in legacy |
| `pacman.ts`, `yolk`, `cuckoo`/PXE, `dad`/`mom`/`love`, `eui` | *Planned / in progress* | Reference legacy modules |
