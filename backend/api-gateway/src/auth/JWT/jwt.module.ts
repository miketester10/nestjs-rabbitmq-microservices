import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt.service';
import { JwtStrategy } from './jwt.strategy';
import { env } from 'src/config/env.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: env.JWT_SECRET,
        global: true,
        signOptions: {
          expiresIn: env.JWT_EXPIRES_IN,
        },
      }),
    }),
  ],
  providers: [JwtAuthService, JwtStrategy],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
