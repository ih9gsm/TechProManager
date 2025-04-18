# TechProManager

TechProManager è una web app full-stack per la gestione di progetti, task e team, composta da un frontend React/TypeScript e un backend Node.js/Express/TypeScript.

## Requisiti
- Node.js >= 18
- pnpm (consigliato) oppure npm/yarn
- PostgreSQL (per il database)

## Installazione

### 1. Clona il repository
```bash
git clone <repo-url>
cd TechProManager
```

### 2. Configura il database
Crea un database PostgreSQL e copia la stringa di connessione.

Crea un file `.env` nella cartella `server` con le seguenti variabili:
```
DATABASE_URL=postgres://user:password@host:port/dbname
JWT_SECRET=una_stringa_sicura
```

### 3. Installa le dipendenze
#### Backend
```bash
cd server
pnpm install # oppure npm install
```
#### Frontend
```bash
cd ../client
pnpm install # oppure npm install
```

### 4. Migra il database
Dalla cartella `server`:
```bash
pnpm run db:generate
pnpm run db:migrate
```

## Avvio dello sviluppo

### 1. Avvia il backend
Dalla cartella `server`:
```bash
pnpm run dev
```
Il backend sarà disponibile su http://localhost:3001 (o 3000).

### 2. Avvia il frontend
Apri un nuovo terminale, vai in `client`:
```bash
pnpm run dev
```
Il frontend sarà disponibile su http://localhost:5173

## Script utili
- `pnpm run build` (in client/server): build di produzione
- `pnpm run lint` (in client): lint del codice frontend
- `pnpm run preview` (in client): anteprima build frontend

## Note
- Assicurati che il frontend punti all'URL corretto del backend (vedi `apiClient.ts` nel client).
- Per la produzione, eseguire `pnpm run build` sia in client che in server.

## Struttura delle cartelle
- `client/` — Frontend React/TypeScript
- `server/` — Backend Node.js/Express/TypeScript
- `shared/` — Tipi TypeScript condivisi

---

Per problemi o domande, apri una issue.