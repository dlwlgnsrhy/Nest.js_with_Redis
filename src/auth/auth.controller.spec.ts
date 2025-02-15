/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/user.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../database/user.module';
import * as request from 'supertest';
import { RedisServiceMock } from '../redis/redis.mock';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

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
  });

  afterAll(async () => {
    await app.close();
  });
  it('/auth/login (POST) 성공 케이스', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ name: 'testuser', password: 'password' })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('access_token');
      });
  });
  it('/auth/login (POST) 실패 케이스', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ name: 'testuser', password: 'wrongpassword' })
      .expect(401);
  });
});
