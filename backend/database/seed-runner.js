const fs = require('fs');
const path = require('path');
const { query, exec, initializeDatabase } = require('./db');

async function runSeed() {
  console.log('[Seed] Initializing database connection...');
  await initializeDatabase();

  const seedPath = path.join(__dirname, '../../database/seed.sql');
  console.log('[Seed] Reading seed script from:', seedPath);
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  console.log('[Seed] Executing SQL script into database...');
  try {
    await exec(seedSql);
    console.log('[Seed] Successfully executed seed.sql!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }

  // Verify counts
  const tables = ['users', 'student_profiles', 'projects', 'project_members', 'team_invitations', 'tasks', 'task_comments', 'project_milestones', 'project_documents', 'project_links', 'faculty_reviews'];
  console.log('\n--- VERIFIED DATABASE RECORD COUNTS ---');
  for (const t of tables) {
    const res = await query(`SELECT count(*) FROM ${t}`);
    console.log(`• ${t.padEnd(20)}: ${res.rows[0].count} records`);
  }
  console.log('--------------------------------------\n');
  process.exit(0);
}

runSeed();
