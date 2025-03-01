import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDatabase() {
  try {
    // Create images table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        title TEXT,
        filename TEXT,
        name TEXT,
        mime TEXT,
        extension TEXT,
        width INTEGER,
        height INTEGER,
        size INTEGER,
        time INTEGER,
        expiration INTEGER DEFAULT 0,
        data BLOB,
        url TEXT,
        display_url TEXT,
        delete_url TEXT,
        api_key TEXT
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

export { client };
