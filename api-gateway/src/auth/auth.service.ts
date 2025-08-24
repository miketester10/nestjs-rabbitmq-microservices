import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { JwtAuthService } from './JWT/jwt.service';
import { Jwt2faService } from './JWT-2FA/jwt-2fa.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly jwt2faService: Jwt2faService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ otpRequired: boolean; accessToken: string }> {
    const user = await this.userService.findOne(loginDto.email);

    // Verifica credenziali
    if (!user || !(await bcrypt.compare(loginDto.password, user.password)))
      throw new BadRequestException('Credenziali non valide.');

    // Verifica se l'utente è verificato
    if (!user.isVerified)
      throw new UnauthorizedException(
        'Account non verificato. Completare la verifica email per accedere.',
      );

    if (user.is2faEnabled) {
      // Richiedi OTP (restituisce token temporaneo per 2FA)
      const token = await this.jwt2faService.signToken(user);
      return { otpRequired: true, accessToken: token };
    } else {
      // Login normale (restituisce token JWT standard)
      const token = await this.jwtAuthService.signToken(user);
      return { otpRequired: false, accessToken: token };
    }
  }

  async verifyOtp(
    code: string,
    email: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findOne(email);

    // Verifica se l'utente esiste
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Verifica se la 2FA è abilitata per l'utente
    if (!user.is2faEnabled)
      throw new BadRequestException('2FA non è abilitato per questo utente.');

    // Verifica se il codice OTP ricevuto è valido
    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: code,
      window: 1, // Permette una finestra di 1 intervallo di tempo (30s) per gestire discrepanze di orario
    });

    if (!verified) throw new UnauthorizedException('Codice OTP non valido.');

    // Genera e restituisci un token JWT
    const token = await this.jwtAuthService.signToken(user);
    return { accessToken: token };
  }

  async enable2fa(email: string): Promise<{ qrcode: string; secret: string }> {
    const user = await this.userService.findOne(email);

    // Verifica se l'utente esiste
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Verifica se la 2FA è già abilitata
    if (user.is2faEnabled)
      throw new BadRequestException('2FA è già abilitata per questo utente.');

    // Genera segreto 2FA
    const secret = speakeasy.generateSecret({
      name: `NestJS-RabbitMQ (${user.email})`,
    });

    // Salva il segreto dell'utente ed abilita la 2FA
    await this.userService.update(user, {
      otpSecret: secret.base32, // in produzione, criptare questo valore
      is2faEnabled: true,
    });

    // Crea QR code per l'app di autenticazione
    const qrcode = await QRCode.toDataURL(secret.otpauth_url!); // ritorna una stringa in base64 esempio: data:image/png;base64,iVBORw0K...

    return { qrcode, secret: secret.base32 };
  }
}
