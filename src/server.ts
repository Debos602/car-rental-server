console.log("🔥 REAL BACKEND PROCESS STARTED 🔥", process.pid);


import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import http from 'http';
import { initSocket, getIo, logSocketStatus } from './app/socket';

async function main() {


  try {
    await mongoose.connect(config.database_url as string);
    console.log('MongoDB connected');

    const server = http.createServer(app);

    // initialize socket.io (call once)
    const ioServer = initSocket(server);
    console.log('Socket.io initialized', !!ioServer);

    // listen for low-level engine errors to aid debugging
    ioServer?.engine?.on('connection_error', (err: any) => {
      console.error('Socket engine connection_error:', err);
    });

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      logSocketStatus();
    });


    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Closing server...');

      server.close(() => {
        console.log('HTTP server closed');
      });

      const io = getIo();
      io?.close(() => console.log('Socket server closed'));

      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing server...');

      server.close(() => {
        console.log('HTTP server closed');
      });

      const io = getIo();
      io?.close(() => console.log('Socket server closed'));

      process.exit(0);
    });

  } catch (err) {
    console.error('Server startup error:', err);
  }
}

main();
