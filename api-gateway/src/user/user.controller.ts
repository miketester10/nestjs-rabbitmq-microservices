import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { TokenDto } from './dto/token.dto';
import { EmailDto } from './dto/email.dto';
import { minutes, Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from 'src/auth/JWT/guards/jwt-auth-guard.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get('verify-email')
  async verify(@Query() query: TokenDto) {
    return this.userService.verifyEmail(query.token);
  }

  @Throttle({ general: { ttl: minutes(1), limit: 1 } }) // max 1 richiesta / minuto per IP (ovveride throttler globale)
  @Post('resend-email-verification')
  async resend(@Body() body: EmailDto) {
    return this.userService.resendVerificationEmail(body.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() payload: JwtPayload) {
    return this.userService.getProfile(payload.email);
  }
}
