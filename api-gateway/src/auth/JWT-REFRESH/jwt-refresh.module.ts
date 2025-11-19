import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshService } from './jwt-refresh.service';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { EncryptionService } from '../encryption.service';
import { env } from 'src/config/env.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: env.JWT_REFRESH_SECRET,
        global: true,
        signOptions: {
          expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        },
      }),
    }),
  ],
  providers: [JwtRefreshService, JwtRefreshStrategy, EncryptionService],
  exports: [JwtRefreshService],
})
export class JwtRefreshModule {}
