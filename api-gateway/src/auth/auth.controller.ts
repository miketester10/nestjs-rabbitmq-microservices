import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './JWT/guards/jwt-auth-guard.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  JwtPayload,
  JwtRefreshPayload,
} from 'src/common/interfaces/jwt-payload.interface';
import { Jwt2faGuard } from './JWT-2FA/guards/jwt-2fa-guard.guard';
import { OtpDto } from './dto/otp.dto';
import { JwtRefreshGuard } from './JWT-REFRESH/guards/jwt-refresh-guard.guard';
import { minutes, Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Throttle({ general: { ttl: minutes(1), limit: 4 } }) // max 4 richieste / minuto per IP (override throttler "general")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  async refresh(@CurrentUser() payload: JwtRefreshPayload) {
    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(payload.jti, payload.email);

    return { accessToken, refreshToken };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('enable-2fa')
  async enable2FA(@CurrentUser() payload: JwtPayload) {
    return this.authService.enable2fa(payload.email);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2faGuard)
  @Post('verify-otp')
  async verifyOtp(@Body() otp: OtpDto, @CurrentUser() payload: JwtPayload) {
    return this.authService.verifyOtp(otp.code, payload.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Delete('logout')
  async logout(@CurrentUser() payload: JwtRefreshPayload) {
    return this.authService.logout(payload.jti);
  }
}
