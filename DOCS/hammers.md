# Hammers per penguins-eggs-legacy

Il workflow `.github/workflows/hammers.yml` costruisce i pacchetti dalle ricette
legacy e conserva gli artefatti su GitHub Actions. Si avvia manualmente da
**Actions → Hammers — penguins-eggs-legacy → Run workflow**, sulle pull request
verso `main`/`master` e quando viene inviato un tag `v*`.

Produce:

- Debian: `.deb` per le architetture gestite da `pnpm deb -a` (perrisbrewery).
- Arch e Manjaro: `.pkg.tar.zst`.
- Fedora 42, AlmaLinux 9 e openSUSE Tumbleweed: `.rpm` su x86_64.

Alpine resta esclusa: la relativa build era già disabilitata nel workflow legacy
per problemi di compatibilità dell'ambiente Node/musl. Le build non richiedono
le chiavi GPG del VPS; i pacchetti non vengono firmati da Hammers.

## Pubblicazione

Aggiornare `version` in `package.json` e il contatore nel file `release`,
committare le modifiche e inviare un tag corrispondente, ad esempio
`v26.8.29` per la versione `26.8.29`. Solo la build di un tag pubblica una
GitHub Release, dopo il successo di tutte le build. Il tag deve corrispondere
alla versione del pacchetto.

La release contiene un archivio ZIP per ciascuna famiglia di pacchetti.
Una nuova esecuzione sullo stesso tag sostituisce gli allegati
omonimi. L'avvio manuale produce solo artefatti, senza pubblicare una release.

Il workflow `publish-penguins-eggs-legacy.yaml` che aggiorna i repository sul VPS
rimane separato e manuale. Hammers non modifica i repository del VPS.

## Verifica

Prima di distribuire una nuova versione,
provare installazione e remaster in VM delle distribuzioni interessate.
Le build CI e i checksum non sostituiscono queste prove funzionali.
