import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Jwt2faService } from './jwt-2fa.service';
import { Jwt2faStrategy } from './jwt-2fa.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_2FA_SECRET'),
        global: true,
        signOptions: {
          expiresIn: configService.get<string>('JWT_2FA_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [Jwt2faService, Jwt2faStrategy],
  exports: [Jwt2faService],
})
export class Jwt2faModule {}
