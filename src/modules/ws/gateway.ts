import type { Server, Socket } from 'socket.io';
import { prisma } from '../../db/prisma';

export function registerGateway(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('join', (roomId: string) => socket.join(roomId));

    socket.on('message:new', async (payload: { roomId: string; text: string; userId: string }) => {
      const saved = await prisma.message.create({ data: { roomId: payload.roomId, senderId: payload.userId, body: payload.text } });
      io.to(payload.roomId).emit('message:new', saved);
    });
  });
}
