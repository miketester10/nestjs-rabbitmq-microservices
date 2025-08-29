import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { EmailDto } from 'src/user/dto/email.dto';
import { TokenDto } from 'src/user/dto/token.dto';
import { ResetPasswordDto } from './dto/reset-password';

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
    return this.authService.rotateRefreshToken(payload.jti, payload.email);
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

  @Throttle({ general: { ttl: minutes(1), limit: 1 } }) // max 1 richiesta / minuto per IP (override throttler globale)
  @Post('forgot-password')
  async forgotPassword(@Body() body: EmailDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Throttle({ general: { ttl: minutes(1), limit: 4 } }) // max 4 richieste / minuto per IP (override throttler "general")
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Query() query: TokenDto,
  ) {
    return this.authService.resetPassword(body.password, query.token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Delete('logout')
  async logout(@CurrentUser() payload: JwtRefreshPayload) {
    return this.authService.logout(payload.jti);
  }
}
