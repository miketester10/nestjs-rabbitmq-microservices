import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './JWT/jwt.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtAuthModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
