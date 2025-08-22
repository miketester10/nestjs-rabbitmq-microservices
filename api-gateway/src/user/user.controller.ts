import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    await this.userService.register(createUserDto);
    return 'User registrato con successo. Un link di verifica è stato inviato alla tua email.';
  }

  @Get('verify-email')
  async verify(@Query() query: VerifyEmailDto) {
    await this.userService.verifyEmail(query.token);
    return 'Email verificata con successo';
  }
}
