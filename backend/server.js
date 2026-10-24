const app = require('./app');
const { initializeDatabase } = require('./database/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('[Server] Initializing database layer...');
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Student Project & Team Collaboration Portal API running on http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    process.on('SIGINT', () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
