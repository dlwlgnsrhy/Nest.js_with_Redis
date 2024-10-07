import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from '../src/config/validation.schema';
import configuration from '../src/config/configuration';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { RedisProvider } from '../src/redis.providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/database/user.entity';
import { UserModule } from '../src/database/user.module';
import { RedisModule } from '../src/redis/redis.module';
import { AuthModule } from '../src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //COnfigModule을 전역 모듈로 설정
      validationSchema,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT'), 10),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    UserModule,
    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisProvider],
})
export class AppModule {}
