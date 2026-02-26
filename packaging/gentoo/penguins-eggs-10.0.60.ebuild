# Copyright 2024-2026 Gentoo Authors
# Distributed under the terms of the MIT License

EAPI=8

DESCRIPTION="A console tool that allows you to remaster your system and redistribute it as live images on USB sticks or via PXE"
HOMEPAGE="https://penguins-eggs.net https://github.com/pieroproietti/penguins-eggs"

SRC_URI="https://github.com/pieroproietti/${PN}/archive/refs/tags/v${PV}.tar.gz -> ${P}.tar.gz"
S="${WORKDIR}/${P}"

LICENSE="MIT"
SLOT="0"
KEYWORDS="~amd64 ~arm64"

DEPEND="
	>=net-libs/nodejs-18[npm]
"

RDEPEND="
	>=net-libs/nodejs-18
	app-arch/squashfs-tools
	app-cdr/libisoburn
	app-misc/jq
	dev-libs/openssl
	dev-vcs/git
	net-misc/rsync
	net-misc/wget
	sys-apps/findutils
	sys-apps/pv
	sys-apps/util-linux
	sys-block/parted
	sys-boot/grub:2
	sys-boot/syslinux
	sys-fs/cryptsetup
	sys-fs/dosfstools
	sys-fs/erofs-utils
	sys-fs/lvm2
	sys-fs/mtools
	sys-kernel/dracut
	sys-libs/efivar
	x11-misc/xdg-utils
"

BDEPEND="
	>=net-libs/nodejs-18[npm]
	sys-apps/coreutils
"

src_compile() {
	if ! command -v pnpm &>/dev/null; then
		npm install -g pnpm || die "Failed to install pnpm"
	fi

	NODE_ENV=development pnpm install || die "pnpm install failed"
	pnpm build || die "pnpm build failed"

	rm -rf node_modules
	pnpm install --prod || die "pnpm install --prod failed"
}

src_install() {
	local instdir="/usr/lib/${PN}"

	insinto "${instdir}"
	doins .oclif.manifest.json package.json

	local dirs=(addons assets bin conf dist dracut eui mkinitcpio mkinitfs node_modules scripts)
	for d in "${dirs[@]}"; do
		if [[ -d "${d}" ]]; then
			cp -r "${d}" "${ED}${instdir}/" || die
		fi
	done

	dodoc README.md

	doman manpages/doc/man/eggs.1.gz

	insinto /usr/share/applications
	doins assets/penguins-eggs.desktop

	insinto /usr/share/pixmaps
	doins assets/eggs.png

	fperms +x "${instdir}/bin/run.js"

	dosym "${instdir}/bin/run.js" /usr/bin/eggs

	insinto /usr/share/bash-completion/completions
	dosym "${instdir}/scripts/eggs.bash" /usr/share/bash-completion/completions/eggs.bash

	insinto /usr/share/zsh/site-functions
	dosym "${instdir}/scripts/_eggs" /usr/share/zsh/site-functions/_eggs
}

pkg_postinst() {
	elog "To configure penguins-eggs, run:"
	elog "  sudo eggs dad -d"
	elog ""
	elog "To create a live ISO of your system:"
	elog "  sudo eggs produce"
	elog ""
	elog "For the krill installer (CLI-based):"
	elog "  sudo eggs install"
}
