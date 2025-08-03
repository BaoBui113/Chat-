import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  private createClient(label: string): Redis {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    const options: RedisOptions = {
      host,
      port,
      password,
    };

    const client = new Redis(options);
    this.setupLogging(client, label);
    return client;
  }

  private setupLogging(client: Redis, label: string) {
    client.on('connect', () => {
      console.log(`[Redis ${label}] Connecting...`);
    });

    client.on('ready', () => {
      console.log(`[Redis ${label}] Connected & Ready ✅`);
    });

    client.on('error', (err) => {
      console.error(`[Redis ${label}] Error ❌`, err.message);
    });

    client.on('close', () => {
      console.warn(`[Redis ${label}] Connection closed`);
    });
  }

  async publish(channel: string, message: any) {
    if (!this.publisher) {
      this.publisher = this.createClient('Publisher');
    }

    await this.publisher.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, handler: (message: any) => void) {
    if (!this.subscriber) {
      this.subscriber = this.createClient('Subscriber');
    }

    this.subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error(
          `[Redis Subscriber] Failed to subscribe to channel ${channel}`,
          err.message,
        );
      } else {
        console.log(`[Redis Subscriber] Subscribed to channel: ${channel}`);
      }
    });

    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          handler(parsed);
        } catch (err) {
          console.error(`[Redis Subscriber] Failed to parse message:`, msg);
        }
      }
    });
  }
}
