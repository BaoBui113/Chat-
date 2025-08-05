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

  afterInit() {
    console.log('ChatGateway initialized');
    this.redisService.subscribe(
      'chat',
      (message: {
        receiverId: string;
        senderId: string;
        [key: string]: any;
      }) => {
        const { receiverId, senderId, ...rest } = message;
        console.log(
          `Received message from ${senderId} to ${receiverId}:`,
          rest,
        );

        this.server.to(`user_${receiverId}`).emit('chat', {
          senderId,
          receiverId,
          ...rest,
        });

        this.server.to(`user_${senderId}`).emit('chat', {
          senderId,
          receiverId,
          ...rest,
        });
      },
    );
  }

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;

    console.log('in vao socket');

    if (userId) {
      socket.join(`user_${userId}`);
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
