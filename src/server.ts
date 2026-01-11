import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import http from 'http';
import { initSocket } from './app/socket';

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    const server = http.createServer(app);

    // initialize socket.io
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
main();
