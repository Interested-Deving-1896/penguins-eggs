# Gentoo Packaging for Penguins-Eggs

## Using the overlay

```bash
cat > /etc/portage/repos.conf/penguins-eggs.conf << 'EOF'
[penguins-eggs]
location = /var/db/repos/penguins-eggs
sync-type = git
sync-uri = https://github.com/pieroproietti/penguins-eggs.git
auto-sync = no
EOF
```

## Install

```bash
emerge --ask app-misc/penguins-eggs
```

## Configure

```bash
sudo eggs dad -d
```

## Create a live ISO

```bash
sudo eggs produce
```
