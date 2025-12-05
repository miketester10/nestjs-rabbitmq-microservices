import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Jwt2faService } from './jwt-2fa.service';
import { Jwt2faStrategy } from './jwt-2fa.strategy';
import { env } from 'src/config/env.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: env.JWT_2FA_SECRET,
        global: true,
        signOptions: {
          expiresIn: env.JWT_2FA_EXPIRES_IN,
        },
      }),
    }),
  ],
  providers: [Jwt2faService, Jwt2faStrategy],
  exports: [Jwt2faService],
})
export class Jwt2faModule {}
