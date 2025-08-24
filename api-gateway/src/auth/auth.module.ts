import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './JWT/jwt.module';
import { UserModule } from 'src/user/user.module';
import { Jwt2faModule } from './JWT-2FA/jwt-2fa.module';

@Module({
  imports: [JwtAuthModule, Jwt2faModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
