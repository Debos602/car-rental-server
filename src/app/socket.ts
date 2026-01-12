import http from 'http';
import { Server } from 'socket.io';
import config from './config';

let io: Server | null = null;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: config.Client_url || "http://localhost:5173",

            credentials: true,
        },
    });

    // Socket server তৈরি হয়ে গেছে, এখন client count দেখানো যায়
    console.log('Socket initialized, connected clients:', io.engine.clientsCount);

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join', (room) => {
            try {
                socket.join(room);
                console.log(`Socket ${socket.id} joined room: ${room}`);
            } catch (err) {
                console.error('Error joining room:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });

    return io;
};

console.log('Socket module loaded', io);

export const getIo = () => io;

// Helper to print connected clients
export const logSocketStatus = () => {
    if (io) {
        console.log('Connected clients:', io.engine.clientsCount);
    } else {
        console.log('Socket server not initialized');
    }
};
