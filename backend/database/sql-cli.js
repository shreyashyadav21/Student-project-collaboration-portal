const readline = require('readline');
const { query, initializeDatabase } = require('./db');

async function startCli() {
  await initializeDatabase();
  console.log('\n======================================================');
  console.log('   STUDENT PORTAL - POSTGRESQL INTERACTIVE CLI');
  console.log('======================================================');
  console.log('Type any SQL query ending with a semicolon (;) or type:');
  console.log('  .tables    - List all tables');
  console.log('  .schema    - View table definitions');
  console.log('  .exit      - Exit the CLI\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'postgres=# '
  });

  rl.prompt();

  let buffer = '';

  rl.on('line', async (line) => {
    const trimmed = line.trim();

    if (trimmed === '.exit' || trimmed === 'exit' || trimmed === 'quit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    if (trimmed === '.tables') {
      const res = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
      console.log('\nTables in database:');
      console.log(res.rows.map(r => '  • ' + r.table_name).join('\n'));
      console.log('');
      rl.prompt();
      return;
    }

    if (trimmed === '.schema') {
      const res = await query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position");
      console.table(res.rows);
      rl.prompt();
      return;
    }

    buffer += ' ' + line;

    if (buffer.trim().endsWith(';')) {
      const sqlToExecute = buffer.trim();
      buffer = '';
      try {
        const start = Date.now();
        const res = await query(sqlToExecute);
        const duration = Date.now() - start;

        if (res.rows && res.rows.length > 0) {
          console.table(res.rows);
          console.log(`(${res.rows.length} rows in ${duration}ms)\n`);
        } else {
          console.log(`Query OK, ${res.rowCount || 0} rows affected (${duration}ms)\n`);
        }
      } catch (err) {
        console.error(`ERROR: ${err.message}\n`);
      }
      rl.prompt();
    } else {
      rl.setPrompt('postgres-# ');
      rl.prompt();
      rl.setPrompt('postgres=# ');
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

startCli().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
