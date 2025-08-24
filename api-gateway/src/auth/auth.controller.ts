import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './JWT/guards/jwt-auth-guard.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Jwt2faGuard } from './JWT-2FA/guards/jwt-2fa-guard.guard';
import { OtpDto } from './dto/otp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2faGuard)
  @Post('verify-otp')
  async verifyOtp(@Body() otp: OtpDto, @CurrentUser() payload: JwtPayload) {
    return this.authService.verifyOtp(otp.code, payload.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('enable-2fa')
  async enable2FA(@CurrentUser() payload: JwtPayload) {
    return this.authService.enable2fa(payload.email);
  }
}
