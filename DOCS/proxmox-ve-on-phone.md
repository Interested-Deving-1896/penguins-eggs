# Configurazione Proxmox VE per tethering USB con cellulare (es. ILIAD)

Trovandomi attualmente sprovvisto di linea fissa, ho avuto la necessità di utilizzare la connessione del mio smartphone per fornire accesso a Internet all'intero nodo Proxmox e alle relative macchine virtuali.

I seguenti sono i parametri utilizzati sulla mia macchina. La procedura prevede l'utilizzo di uno script bash che crea dinamicamente un bridge di rete (`vmbr1`) dedicato alla connessione USB. In questo modo si lascia intatta la configurazione originale del server, permettendo di tornare alla normalità semplicemente riavviando la macchina o ricaricando le interfacce di rete.

### Prerequisiti
1. Collegare lo smartphone via cavo USB al server Proxmox.
2. Attivare l'opzione "Tethering USB" (o "Condivisione USB") nelle impostazioni di rete del telefono.
3. Assicurarsi che nel file `/etc/network/interfaces` non ci siano configurazioni residue o rotte di default in conflitto che puntino a router attualmente offline.

### Lo Script di connessione (`tether-up.sh`)

Creare un file eseguibile con questo codice. 

**Nota Bene:** Android (e provider come Iliad) tendono a cambiare la sottorete e l'IP del gateway ogni volta che si disattiva e riattiva il tethering. Se al riavvio successivo lo script non dovesse instradare correttamente il traffico, basterà leggere il nuovo IP del gateway fornito dal DHCP e aggiornare la variabile `ILIAD_GATEWAY`.

```bash
#!/bin/bash

# --- Parametri ---
# Inserire qui l'indirizzo IP del telefono (Gateway) fornito dal provider.
ILIAD_GATEWAY="10.242.162.232"
# -----------------

echo "=== Avvio configurazione tethering USB ==="

# Ricarica la configurazione di rete pulita da /etc/network/interfaces
ifreload -a

# Trova dinamicamente l'interfaccia USB generata dallo smartphone (inizia per 'enx')
TETHER_IFACE=$(ip -br link | grep '^enx' | awk '{print $1}')

if [ -z "$TETHER_IFACE" ]; then
    echo "Errore: Nessuna interfaccia USB trovata. Verifica il cavo e le impostazioni del telefono."
    exit 1
fi

echo "Interfaccia trovata: $TETHER_IFACE"

# Pulisce un eventuale bridge precedente (silenzia gli errori se non esiste)
ip link del vmbr1 > /dev/null 2>&1

# Crea il bridge in RAM e attiva le interfacce fisiche
echo "Creazione bridge provvisorio vmbr1..."
ip link add name vmbr1 type bridge
ip link set "$TETHER_IFACE" up
ip link set vmbr1 up

# Collega l'interfaccia USB al nuovo bridge
ip link set "$TETHER_IFACE" master vmbr1

# Rilascia vecchi lease e richiede l'assegnazione del nuovo IP dinamico
echo "Negoziazione DHCP in corso..."
dhclient -r vmbr1 2>/dev/null
dhclient -v vmbr1

# Pulisce le rotte di default conflittuali e forza l'instradamento verso il cellulare
echo "Impostazione della rotta di default verso $ILIAD_GATEWAY..."
ip route del default > /dev/null 2>&1
ip route add default via "$ILIAD_GATEWAY" dev vmbr1

echo "========================================="
echo "Configurazione completata! Test di connessione in corso:"
ping -c 4 8.8.8.8
```
