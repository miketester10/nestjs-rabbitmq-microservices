import {
  BadRequestException,
  Inject,
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
import { JwtRefreshService } from './JWT-REFRESH/jwt-refresh.service';
import { Jwt2faService } from './JWT-2FA/jwt-2fa.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtKey } from 'src/common/enums/cache-keys.enum';
import { EncryptionService } from './encryption.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly jwt2faService: Jwt2faService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    otpRequired: boolean;
    accessToken: string;
    refreshToken?: string;
  }> {
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
      // Richiedi OTP (restituisce accessToken temporaneo per 2FA)
      const token2fa = await this.jwt2faService.signToken(user);
      return { otpRequired: true, accessToken: token2fa };
    } else {
      // Login normale (restituisce accessToken standard e refreshToken)
      const accessToken = await this.jwtAuthService.signToken(user);
      const refreshToken = await this.jwtRefreshService.signToken(user);
      return { otpRequired: false, accessToken, refreshToken };
    }
  }

  async rotateRefreshToken(
    oldJti: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Elimina il vecchio refreshToken dalla cache Redis
    await this.cacheManager.del(`${JwtKey.REFRESH}:${oldJti}`);

    // Verifica se l'utente esiste
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Genera una nuova coppia di accessToken e refreshToken
    const accessToken = await this.jwtAuthService.signToken(user);
    const refreshToken = await this.jwtRefreshService.signToken(user);
    return { accessToken, refreshToken };
  }

  async verifyOtp(
    code: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findOne(email);

    // Verifica se l'utente esiste
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Verifica se la 2FA è abilitata per l'utente
    if (!user.is2faEnabled || !user.otpSecret)
      throw new BadRequestException('2FA non è abilitato per questo utente.');

    // Decrypt secret salvato nel DB
    const decryptedSecret = this.encryptionService.decrypt(user.otpSecret);

    // Verifica se il codice OTP ricevuto è valido
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1, // Permette una finestra di 1 intervallo di tempo (30s) per gestire discrepanze di orario
    });

    if (!verified) throw new UnauthorizedException('Codice OTP non valido.');

    // Restituisce accessToken standard e refreshToken
    const accessToken = await this.jwtAuthService.signToken(user);
    const refreshToken = await this.jwtRefreshService.signToken(user);
    return { accessToken, refreshToken };
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

    // Encrypt secret prima di salvarlo nel DB
    const encryptedSecret = this.encryptionService.encrypt(secret.base32);

    // Salva il segreto dell'utente ed abilita la 2FA
    await this.userService.update(user, {
      otpSecret: encryptedSecret,
      is2faEnabled: true,
    });

    // Crea QR code per l'app di autenticazione
    const qrcode = await QRCode.toDataURL(secret.otpauth_url!); // ritorna una stringa in base64 esempio: data:image/png;base64,iVBORw0K...

    return { qrcode, secret: secret.base32 };
  }

  async logout(oldJti: string): Promise<string> {
    // Elimina il vecchio refreshToken dalla cache Redis
    await this.cacheManager.del(`${JwtKey.REFRESH}:${oldJti}`);
    return 'Logout effettuato con successo.';
  }
}
