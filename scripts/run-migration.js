const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const { execSync } = require('child_process');
const sql = execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    
    // Split by semicolons and run each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        try {
          await client.query(stmt);
          console.log(`Executed statement ${i + 1}/${statements.length}`);
        } catch (err) {
          console.error(`Error on statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

runMigration();
