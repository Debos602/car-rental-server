import http from 'http';
import { Server } from 'socket.io';
import config from './config';

let io: Server | null = null;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: config.Client_url,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join', (room) => {
            try {
                socket.join(room);
            } catch (err) {
                // ignore
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });

    return io;
};

export const getIo = () => io;
