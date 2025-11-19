import { createKeyv } from '@keyv/redis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import Redis from 'ioredis';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { env } from './config/env.schema';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            createKeyv({
              url: env.REDIS_URL,
              password: env.REDIS_PASSWORD,
            }),
          ],
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        return {
          throttlers: [
            {
              name: 'general',
              ttl: minutes(1),
              limit: 100,
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host: env.REDIS_HOST,
              port: env.REDIS_PORT,
              password: env.REDIS_PASSWORD,
            }),
          ),
          errorMessage: 'Too many requests, please try again later.',
        };
      },
    }),
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
