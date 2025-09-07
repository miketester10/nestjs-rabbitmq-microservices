import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRefreshService } from './jwt-refresh.service';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { EncryptionService } from '../encryption.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET'),
        global: true,
        signOptions: {
          expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [JwtRefreshService, JwtRefreshStrategy, EncryptionService],
  exports: [JwtRefreshService],
})
export class JwtRefreshModule {}
