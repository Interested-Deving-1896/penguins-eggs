# Distribution Plugins

ISO hosting, versioning, centralized distribution, and OTA delivery.

## Plugins

| Plugin | Project | Status |
|---|---|---|
| penguins-over-the-air | linux-over-the-air (Debian fork) | Implemented |
| lfs-tracker | git-lfs + giftless | Planned |
| gogs-registry | gogs | Planned |
| opengist-sharing | opengist | Planned |

## penguins-over-the-air

OTA update delivery for eggs-produced ISOs. After `eggs produce`, automatically
creates a lota-format bundle and registers it with the configured OTA server.
Devices running penguins-over-the-air can then pull the update over the network.

**Files:**
- `pota-client.ts` — TypeScript client for the pota engine and bundle API
- `produce-hook.ts` — `beforeProduce` / `afterProduce` hooks for `eggs produce`
- `command-pota.ts` — `eggs pota` command (status, update, rollback, channel, android)

**Configuration** (`/etc/penguins-eggs.d/pota.yaml`):
```yaml
pota:
  enabled: true
  server_url: "http://your-pota-server:8080"
  channel: stable
  bundle_output_dir: /var/lib/pota/bundles
  register_after_produce: true
```

**Upstream:** [penguins-over-the-air](https://github.com/Interested-Deving-1896/penguins-over-the-air)
(Debian fork of [linux-over-the-air](https://github.com/Interested-Deving-1896/linux-over-the-air))

## lfs-tracker

Tracks ISOs in git-lfs after `eggs produce`. Supports giftless (S3/GCS/Azure)
and lfs-test-server (local dev) as backends.

## gogs-registry

Self-hosted git service as a private ISO registry. Docker Compose deployment
with LFS enabled.

## opengist-sharing

Share wardrobe costumes as git-backed gists. `eggs wardrobe share` and
`eggs wardrobe import` commands.
