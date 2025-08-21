import { Body, Controller, Post } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

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
}
