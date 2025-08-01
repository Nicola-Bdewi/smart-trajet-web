// /src/utils/db.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Create a fallback for web platform
let db: any = null;

if (Platform.OS !== 'web') {
  // open the database (sync) - only for native platforms
  db = SQLite.openDatabaseSync('addresses.db');
} else {
  // Web fallback - use localStorage or IndexedDB
  console.log('⚠️ SQLite not available on web, using localStorage fallback');
}

// run your initial schema creation
export async function initDb() {
  if (Platform.OS === 'web') {
    console.log('✅ Web DB initialized (using localStorage)');
    return;
  }
  
  if (db) {
    // NOTE: execAsync is available on the object returned by openDatabaseSync
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS saved_addrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      lon REAL NOT NULL,
      lat REAL NOT NULL
    );
  `);
    console.log('✅ DB initialized');
  }
}

// Export db for use in other files
export { db };
