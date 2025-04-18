import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Carica variabili d'ambiente
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const dbType = process.env.DATABASE_TYPE;

// Funzione principale per la migrazione
async function runMigration() {
  if (dbType !== 'postgres' || !dbUrl) {
    console.log('⚠️ Non è possibile eseguire migrazioni: database non configurato come PostgreSQL');
    return;
  }

  // Directory delle migrazioni
  const migrationsFolder = path.join(__dirname, 'migrations');

  // Crea la cartella migrations se non esiste
  if (!fs.existsSync(migrationsFolder)) {
    fs.mkdirSync(migrationsFolder, { recursive: true });
  }

  try {
    console.log('🔄 Inizializzazione migrazione database...');
    
    // Connessione al database
    const pool = new Pool({
      connectionString: dbUrl,
    });
    
    const db = drizzle(pool, { schema });
    
    // Esegui la migrazione
    await migrate(db, { migrationsFolder });
    
    console.log('✅ Migrazione database completata');
    
    // Chiudi la connessione
    await pool.end();
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    process.exit(1);
  }
}

// Esegui la migrazione
runMigration().catch(console.error);

// Esporta la funzione per poterla chiamare da altri file
export default runMigration;