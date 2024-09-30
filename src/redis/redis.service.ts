// src/redis/redis.service.ts

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  //토큰을 블랙리스트에 추가
  async addTokenToBlacklist(token: string, expiresIn: number): Promise<void> {
    const ttl = expiresIn - Math.floor(Date.now() / 1000);
    await this.redisClient.set(`blacklist:${token}`, 'true', 'EX', ttl);
  }

  //토큰이 블랙리스트에 있는지 확인
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist:${token}`);
    return result === 'true';
  }
}
