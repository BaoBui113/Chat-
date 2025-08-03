// chat/chat.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis.service';

// chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true, // Backward compatibility
  transports: ['websocket', 'polling'], // Cho phép cả websocket và polling
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  async afterInit() {
    console.log('ChatGateway initialized');
    this.redisService.subscribe('chat', (message) => {
      const { receiverId, senderId, ...rest } = message;
      this.server.to(`user_${senderId}_${receiverId}`).emit('chat', rest);
      console.log(`Message sent to user_${senderId}_${receiverId}:`, rest);
    });
  }

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId;
    const senderId = socket.handshake.query.senderId;
    console.log('in vao socket');

    if (userId) {
      socket.join(`user_${userId}_${senderId}`);
      console.log(`[Socket] User ${userId} connected`);
      console.log(
        '📋 All rooms:',
        Array.from(this.server.sockets.adapter.rooms.keys()),
      );
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  }
}
