// src/redis/redis.service.ts

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  async addTokenToBlacklist(token: string, expiresIn: number): Promise<void> {
    const ttl = expiresIn - Math.floor(Date.now() / 1000);
    await this.redisClient.set(`blacklist:${token}`, 'true', 'EX', ttl);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist:${token}`);
    return result === 'true';
  }
}
