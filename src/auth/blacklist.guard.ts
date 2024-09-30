// src/auth/blacklist.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await this.redisService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return true;
  }
}
