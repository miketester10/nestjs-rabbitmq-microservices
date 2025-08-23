import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from './JWT/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(loginDto.email);

    // Verifica credenziali
    if (!user || !(await bcrypt.compare(loginDto.password, user.password)))
      throw new BadRequestException('Credenziali non valide.');

    // Verifica se l'utente è verificato
    if (!user.isVerified)
      throw new UnauthorizedException(
        'Account non verificato. Completare la verifica email per accedere.',
      );

    // Genera e restituisci un token JWT
    const token = await this.jwtAuthService.signToken(user);
    return { access_token: token };
  }
}
