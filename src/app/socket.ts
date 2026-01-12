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
        // এই দুটো লাইন অ্যাড করো
        pingTimeout: 60000,       // 60 সেকেন্ড (ডিফল্ট 5s ছিল)
        pingInterval: 25000,      // প্রতি 25 সেকেন্ডে ping
    });
    // Socket server তৈরি হয়ে গেছে, এখন client count দেখানো যায়
    const initialCount = io?.sockets?.sockets?.size ?? io?.engine?.clientsCount ?? 0;
    console.log('Socket initialized, connected clients:', initialCount);

    io.on('connection', (socket) => {
        const currentCount = io?.sockets?.sockets?.size ?? io?.engine?.clientsCount ?? 0;
        console.log('Socket connected:', socket.id, 'connected clients:', currentCount);

        socket.on('join', (room) => {
            try {
                socket.join(room);
                console.log(`Socket ${socket.id} joined room: ${room}`);

                // Diagnostic: report whether the room now exists and its member count
                const roomExists = !!io?.sockets?.adapter?.rooms?.has(room);
                const roomSize = roomExists ? io?.sockets?.adapter?.rooms?.get(room)?.size ?? 0 : 0;
                console.log(`Room '${room}' exists: ${roomExists}, members: ${roomSize}`);

            } catch (err) {
                console.error('Error joining room:', err);
            }
        });

        socket.on('disconnect', () => {
            const afterDisconnectCount = io?.sockets?.sockets?.size ?? io?.engine?.clientsCount ?? 0;
            console.log('Socket disconnected:', socket.id, 'connected clients:', afterDisconnectCount);
        });
    });

    return io;
};

console.log('Socket module loaded', !!io);

export const getIo = () => io;

// Helper to print connected clients
export const logSocketStatus = () => {
    if (io) {
        const count = io?.sockets?.sockets?.size ?? io?.engine?.clientsCount ?? 0;
        console.log('Connected clients:', count);
    } else {
        console.log('Socket server not initialized');
    }
};
