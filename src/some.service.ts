import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class SomeService {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}
  async getCache(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }
}
