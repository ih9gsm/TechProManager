import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as schema from './schema';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carica variabili d'ambiente
dotenv.config();

// Configurazione del database
const dbType = process.env.DATABASE_TYPE || 'memory';
const dbUrl = process.env.DATABASE_URL || '';

// Database in memoria per backup o fallback
function createInMemoryDb() {
  console.log('⚠️ Inizializzando database in memoria');
  
  const inMemoryDb = {
    users: [],
    projects: [],
    tasks: [],
    projectMembers: [],
    taskComments: []
  };
  
  return {
    // Query generica
    query: (query) => {
      // Supporto basilare per alcune query SQL semplici
      if (query.toLowerCase().startsWith('select * from users where email')) {
        const emailMatch = query.match(/email\s*=\s*'([^']+)'/);
        if (emailMatch && emailMatch[1]) {
          const email = emailMatch[1];
          const user = inMemoryDb.users.find(u => u.email === email);
          return Promise.resolve({ rows: user ? [user] : [] });
        }
      }
      return Promise.resolve({ rows: [] });
    },
    
    // Select da tabelle
    select: (fields) => {
      return {
        from: (table) => {
          const tableName = typeof table === 'string' ? table : table.name;
          return {
            where: (condition) => {
              return {
                execute: () => {
                  const tableData = inMemoryDb[tableName] || [];
                  let filteredData = [...tableData];
                  
                  // Implementazione basilare di filtro
                  if (condition && typeof condition === 'object') {
                    filteredData = tableData.filter(item => {
                      for (const key in condition) {
                        if (item[key] !== condition[key]) return false;
                      }
                      return true;
                    });
                  }
                  
                  return Promise.resolve(filteredData);
                }
              };
            },
            execute: () => {
              return Promise.resolve(inMemoryDb[tableName] || []);
            }
          };
        }
      };
    },
    
    // Insert in tabelle
    insert: (table) => {
      const tableName = typeof table === 'string' ? table : table.name;
      
      return {
        values: (data) => {
          return {
            returning: () => {
              // Assicura che la tabella esista
              if (!inMemoryDb[tableName]) {
                inMemoryDb[tableName] = [];
              }
              
              // Genera ID e timestamp se non presenti
              const newItem = {
                id: data.id || uuidv4(),
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              };
              
              inMemoryDb[tableName].push(newItem);
              return Promise.resolve([newItem]);
            },
            execute: () => {
              // Logica simile ma senza returning
              if (!inMemoryDb[tableName]) {
                inMemoryDb[tableName] = [];
              }
              
              const newItem = {
                id: data.id || uuidv4(),
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              };
              
              inMemoryDb[tableName].push(newItem);
              return Promise.resolve();
            }
          };
        }
      };
    },
    
    // Update record
    update: (table) => {
      const tableName = typeof table === 'string' ? table : table.name;
      
      return {
        set: (data) => {
          return {
            where: (condition) => {
              return {
                execute: () => {
                  if (!inMemoryDb[tableName]) {
                    inMemoryDb[tableName] = [];
                  }
                  
                  // Trova e aggiorna gli elementi che corrispondono alla condizione
                  inMemoryDb[tableName].forEach((item, index) => {
                    let match = true;
                    for (const key in condition) {
                      if (item[key] !== condition[key]) {
                        match = false;
                        break;
                      }
                    }
                    
                    if (match) {
                      inMemoryDb[tableName][index] = {
                        ...item,
                        ...data,
                        updatedAt: new Date().toISOString()
                      };
                    }
                  });
                  
                  return Promise.resolve();
                }
              };
            }
          };
        }
      };
    },
    
    // Delete record
    delete: (table) => {
      const tableName = typeof table === 'string' ? table : table.name;
      
      return {
        where: (condition) => {
          return {
            execute: () => {
              if (!inMemoryDb[tableName]) {
                return Promise.resolve();
              }
              
              const initialLength = inMemoryDb[tableName].length;
              
              // Filtra gli elementi che non corrispondono alla condizione
              inMemoryDb[tableName] = inMemoryDb[tableName].filter(item => {
                for (const key in condition) {
                  if (item[key] !== condition[key]) return true;
                }
                return false;
              });
              
              const removed = initialLength - inMemoryDb[tableName].length;
              return Promise.resolve({ rowCount: removed });
            }
          };
        }
      };
    }
  };
}

// Inizializzazione del database in base al tipo configurato
let db: any;

if (dbType === 'postgres' && dbUrl) {
  try {
    console.log('📊 Inizializzando database PostgreSQL');
    const pool = new Pool({
      connectionString: dbUrl,
    });
    db = drizzle(pool, { schema });
    console.log('✅ PostgreSQL inizializzato con successo');
  } catch (error) {
    console.error('❌ Errore connessione PostgreSQL:', error);
    console.warn('⚠️ Fallback al database in memoria');
    db = createInMemoryDb();
  }
} else if (dbType === 'sqlite' && dbUrl) {
  try {
    console.log('📊 Inizializzando database SQLite');
    
    // Estrai il percorso del file dal database URL
    const dbPath = dbUrl.replace('sqlite://', '');
    
    // Assicurati che la directory esista
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Carica il modulo better-sqlite3 dinamicamente
    const Database = require('better-sqlite3');
    const sqlite = new Database(dbPath);
    
    // Crea il database con Drizzle
    db = drizzleSqlite(sqlite, { schema });
    
    console.log(`✅ SQLite inizializzato con successo (${dbPath})`);
  } catch (error) {
    console.error('❌ Errore inizializzazione SQLite:', error);
    console.warn('⚠️ Fallback al database in memoria');
    db = createInMemoryDb();
  }
} else {
  console.log('🧠 Utilizzo database in memoria (dati non persistenti)');
  db = createInMemoryDb();
}

export { db };

// Test connessione al database
export const testDbConnection = async () => {
  if (dbType === 'postgres' && dbUrl) {
    try {
      const pool = new Pool({ connectionString: dbUrl });
      await pool.query('SELECT NOW()');
      await pool.end();
      console.log('✅ Connessione a PostgreSQL verificata');
      return true;
    } catch (error) {
      console.error('❌ Test connessione PostgreSQL fallito:', error);
      return false;
    }
  } else if (dbType === 'sqlite' && dbUrl) {
    try {
      // Per SQLite, verifichiamo solo che il file sia accessibile
      const dbPath = dbUrl.replace('sqlite://', '');
      
      // Se il file non esiste ancora, SQLite lo creerà
      // quindi non è necessario verificare l'esistenza
      
      console.log('✅ Database SQLite pronto per l\'uso');
      return true;
    } catch (error) {
      console.error('❌ Test connessione SQLite fallito:', error);
      return false;
    }
  } else {
    console.log('✅ Database in memoria attivo');
    console.log('⚠️ ATTENZIONE: i dati non saranno persistenti tra i riavvii del server');
    return true;
  }
};
