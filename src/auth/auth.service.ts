// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../database/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 사용자 인증 메서드
  async validateUser(username: string, pass: string): Promise<any> {
    const users = await this.usersService.findAll();
    const user = users.find((user) => user.name === username);
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // 비밀번호 제외
      return result;
    }
    return null;
  }

  // 로그인 메서드
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  //토큰 디코딩 메서드 추가
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
