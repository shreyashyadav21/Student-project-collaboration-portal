const fs = require('fs');
const path = require('path');
const { query, initializeDatabase } = require('./db');

async function reseed() {
  await initializeDatabase();
  const seedSql = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');
  await query('UPDATE users SET password_hash = \'$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe\'');
  console.log('Password hashes updated successfully to match password123!');
  process.exit(0);
}

reseed().catch(err => {
  console.error('Reseed error:', err);
  process.exit(1);
});
