import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOne(loginDto.email);

    // Verifica credenziali
    if (!user || !(await bcrypt.compare(loginDto.password, user.password)))
      throw new BadRequestException('Credenziali non valide.');

    // Verifica se l'utente è verificato
    if (!user.isVerified)
      throw new UnauthorizedException(
        'Account non verificato. Completare la verifica email per accedere.',
      );
  }
}
