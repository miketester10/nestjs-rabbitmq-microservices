import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { TokenDto } from './dto/token.dto';
import { EmailDto } from './dto/email.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @Get('verify-email')
  async verify(@Query() query: TokenDto) {
    return await this.userService.verifyEmail(query.token);
  }

  @Post('resend-email-verification')
  // @Throttle(1, 60) // max 1 richiesta / minuto per IP
  async resend(@Body() body: EmailDto) {
    return this.userService.resendVerificationEmail(body.email);
  }
}
