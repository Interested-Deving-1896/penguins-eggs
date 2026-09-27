#!/usr/bin/env bash
# Run inside the disposable Hammers build container, from the repository root.
set -euo pipefail
family=${1:?Usage: build.sh debian|arch|manjaro|fedora|el9|opensuse}
version=$(node -p 'require("./package.json").version')
release=$(tr -d '[:space:]' < release)
[[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ && $release =~ ^[0-9]+$ ]]
mkdir -p artifacts
case "$family" in
  debian)
    pnpm install --frozen-lockfile
    pnpm deb -a
    cp releases/*.deb artifacts/
    ;;
  arch|manjaro)
    recipe="packaging/$family/PKGBUILD"
    sed -i "s/^pkgver=.*/pkgver=$version/; s/^pkgrel=.*/pkgrel=$release/" "$recipe"
    id builder >/dev/null 2>&1 || useradd -m builder
    echo 'builder ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/hammers
    chmod 0440 /etc/sudoers.d/hammers
    chown -R builder:builder "$PWD"
    # Build dependencies only; runtime dependencies need not be installed to package JS.
    sudo -u builder bash -euo pipefail -c 'cd "$1"; updpkgsums; makepkg --nodeps --nosign --force --noconfirm' bash "packaging/$family"
    cp packaging/"$family"/*.pkg.tar.zst artifacts/
    ;;
  fedora|el9|opensuse)
    spec=packaging/rpm/penguins-eggs-legacy.spec
    sed -i "s/^Version:.*/Version: $version/; s/^Release:.*/Release: $release%{?dist}/" "$spec"
    topdir=$(mktemp -d)
    mkdir -p "$topdir/SOURCES"
    tar -czf "$topdir/SOURCES/penguins-eggs-legacy.tar.gz" \
      --transform="s,^\.,penguins-eggs-legacy-$version," \
      --exclude=.git --exclude=artifacts .
    curl -fL --retry 3 "https://github.com/pieroproietti/penguins-bootloaders/releases/download/${BOOTLOADERS_VERSION:-v26.1.16}/bootloaders.tar.gz" \
      -o "$topdir/SOURCES/bootloaders.tar.gz"
    rpmbuild --define "_topdir $topdir" -bb "$spec"
    find "$topdir/RPMS" -name '*.rpm' -exec cp {} artifacts/ \;
    ;;
  *) echo "Unsupported family: $family" >&2; exit 1 ;;
esac
# Fail if the build did not produce packages.
find artifacts -type f -print -quit | grep -q .
(cd artifacts && sha256sum ./* > SHA256SUMS)
