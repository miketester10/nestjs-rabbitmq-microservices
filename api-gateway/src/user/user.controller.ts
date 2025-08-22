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
    return {
      message:
        'User registrato con successo. Un link di verifica è stato inviato alla tua email.',
    };
  }

  @Get('verify-email')
  verify(@Query() query: VerifyEmailDto) {
    return this.userService.verifyEmail(query.token);
  }
}
