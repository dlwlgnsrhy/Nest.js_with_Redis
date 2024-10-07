/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication, Response } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Repository } from 'typeorm';
import { UserModule } from '../database/user.module';
import { RedisModule } from '../redis/redis.module';
import { User } from '../database/user.entity';
import * as request from 'supertest';
import { RedisServiceMock } from '../redis/redis.mock';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let moduleFixture: TestingModule;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory',
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
        UserModule,
        RedisModule,
      ],
    })
      .overrideProvider('RedisService')
      .useClass(RedisServiceMock)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    //테스트용 사용자 생성
    const user = new User();
    user.name = 'testuser';
    user.password = '$2b$10$abcdefghijklmnopqrstuv';
    await userRepository.save(user);

    //토큰 발급
    accessToken = jwtService.sign({ sub: user.id, name: user.name });
  });
  afterAll(async () => {
    await app.close();
  });
  it('/users/profile (GET) 성공 케이스', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userId', 1);
        expect(response.body).toHaveProperty('name', 'testuser');
      });
  });
  it('/users/profile (GET) 블랙리스트된 토큰으로 접근', async () => {
    //토큰을 블랙리스트에 추가
    const redisService = moduleFixture.get('RedisService');
    const decoded = jwtService.decode(accessToken) as any;
    await redisService.addTokenToBlacklist(accessToken, decoded.exp);

    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401)
      .then((response) => {
        expect(response.body).toHaveProperty('message', 'Token is blacklisted');
      });
  });
});
