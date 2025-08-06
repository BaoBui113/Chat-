// chat/chat.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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

    // Subscribe to call events
    this.redisService.subscribe(
      'call',
      (callEvent: { type: string; call: any }) => {
        const { type, call } = callEvent;
        console.log(`Call event: ${type}`, call);

        // Send to caller
        this.server.to(`user_${call.caller.id}`).emit('call_event', {
          type,
          call,
          role: 'caller',
        });

        // Send to receiver
        this.server.to(`user_${call.receiver.id}`).emit('call_event', {
          type,
          call,
          role: 'receiver',
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
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      console.log(`[Socket] User ${userId} disconnected`);
      socket.leave(`user_${userId}`);
    }
  }

  @SubscribeMessage('call_offer')
  handleCallOffer(
    socket: Socket,
    data: { offer: any; callId: string; to: string },
  ) {
    console.log('Call offer received:', data.callId);
    this.server.to(`user_${data.to}`).emit('call_offer', {
      offer: data.offer,
      callId: data.callId,
      from: socket.handshake.query.userId,
    });
  }

  @SubscribeMessage('call_answer')
  handleCallAnswer(
    socket: Socket,
    data: { answer: any; callId: string; to: string },
  ) {
    console.log('Call answer received:', data.callId);
    this.server.to(`user_${data.to}`).emit('call_answer', {
      answer: data.answer,
      callId: data.callId,
      from: socket.handshake.query.userId,
    });
  }

  @SubscribeMessage('ice_candidate')
  handleIceCandidate(
    socket: Socket,
    data: { candidate: any; callId: string; to: string },
  ) {
    this.server.to(`user_${data.to}`).emit('ice_candidate', {
      candidate: data.candidate,
      callId: data.callId,
      from: socket.handshake.query.userId,
    });
  }
}
