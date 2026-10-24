const { query, initializeDatabase } = require('./database/db');

async function showDb() {
  await initializeDatabase();

  console.log('\n======================================================');
  console.log('   POSTGRESQL DATABASE INSPECTION (LIVE DATA)');
  console.log('======================================================');

  console.log('\n1. ALL 11 TABLES IN POSTGRESQL SCHEMA:');
  const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log(tables.rows.map(r => r.table_name).join(', '));

  console.log('\n2. REGISTERED USERS (users):');
  const users = await query('SELECT id, name, email, role FROM users');
  console.table(users.rows);

  console.log('\n3. STUDENT PROFILES (student_profiles):');
  const profiles = await query('SELECT user_id, student_identifier, technical_skills FROM student_profiles');
  console.table(profiles.rows);

  console.log('\n4. ACADEMIC PROJECTS (projects):');
  const projects = await query('SELECT id, title, creator_id, deadline, status FROM projects');
  console.table(projects.rows);

  console.log('\n5. TASKS ACROSS KANBAN STAGES (tasks):');
  const tasks = await query('SELECT id, project_id, title, priority, status, assigned_to FROM tasks LIMIT 8');
  console.table(tasks.rows);

  console.log('\n======================================================\n');
  process.exit(0);
}

showDb().catch(err => {
  console.error(err);
  process.exit(1);
});
