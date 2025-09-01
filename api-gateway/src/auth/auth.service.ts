import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
import { JwtKey, ResetPasswordKey } from 'src/common/enums/cache-keys.enum';
import { EncryptionService } from './encryption.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { resetPasswordTemplate } from 'src/email/templates/reset-password';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly jwt2faService: Jwt2faService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
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

  async refreshToken(
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

  async initiate2faSetup(
    email: string,
  ): Promise<{ qrcode: string; secret: string }> {
    const user = await this.userService.findOne(email);

    // Verifica se l'utente esiste
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Verifica se la 2FA è abilitata per l'utente
    if (user.is2faEnabled)
      throw new BadRequestException('2FA è già abilitata per questo utente.');

    // Genera segreto 2FA
    const secret = speakeasy.generateSecret({
      name: `NestJS-RabbitMQ (${user.email})`,
    });

    // Encrypt secret prima di salvarlo nel DB
    const encryptedSecret = this.encryptionService.encrypt(secret.base32);

    // Salva solo il segreto dell'utente (deve effettuare una prima conferma con il codice otp, prima di impostare "is2faEnabled" su True)
    await this.userService.update(user, {
      otpSecret: encryptedSecret,
    });

    // Crea QR code per l'app di autenticazione
    const qrcode = await QRCode.toDataURL(secret.otpauth_url!); // ritorna una stringa in base64 esempio: data:image/png;base64,iVBORw0K...

    return { qrcode, secret: secret.base32 };
  }

  async confirm2faSetup(code: string, email: string): Promise<string> {
    const user = await this.validateOtp(code, email, {
      require2faDisabled: true,
    });

    await this.userService.update(user, { is2faEnabled: true });

    return '2FA abilitata con successo.';
  }

  async verify2faCode(
    code: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.validateOtp(code, email, {
      require2faEnabled: true,
    });

    const accessToken = await this.jwtAuthService.signToken(user);
    const refreshToken = await this.jwtRefreshService.signToken(user);

    return { accessToken, refreshToken };
  }

  async disable2fa(code: string, email: string) {
    const user = await this.validateOtp(code, email, {
      require2faEnabled: true,
    });

    await this.userService.update(user, {
      is2faEnabled: false,
      otpSecret: null,
    });

    return '2FA disabilitata con successo.';
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.findOne(email);

    if (user) {
      // Genera token
      const token = await this.generateToken(email);

      // Costruisci link per reset password
      const baseUrl = this.configService.get<string>('BASE_URL_RESET_PASSWORD');
      const verificationLink = `${baseUrl}?token=${token}`;

      // Costruisci email
      const emailShape: EmailShape = {
        recipients: [email],
        subject: 'Resetta la tua password',
        html: resetPasswordTemplate(user.firstName, verificationLink),
      };

      // Invia email tramite il microservizio via RabbitMQ
      this.logger.debug(`Evento [forgot_password] emesso`);
      this.client.emit('forgot.password', emailShape);
    } else {
      // Logga un avviso se l'utente non esiste
      this.logger.warn(`Nessun account trovato con email ${email}.`);
    }

    // Risposta generica per motivi di sicurezza (contro enumeration attack)
    return "Se c'è un account registrato con questa e-mail, ti invieremo il link per resettare la password a questo indirizzo.";
  }

  async resetPassword(newPassword: string, token: string) {
    // Recupera email dalla cache usando il token
    const email = await this.cacheManager.get<string>(
      `${ResetPasswordKey.TOKEN}:${token}`,
    );
    if (!email) {
      throw new BadRequestException('Token invalido o scaduto.');
    }

    // Controlla se l'utente esiste
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException('Utente non trovato.');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Aggiorna lo stato dell'utente a verificato
    await this.userService.update(user, {
      password: passwordHash,
    });

    // Elimina token e user mapping dalla cache
    await this.cacheManager.del(`${ResetPasswordKey.TOKEN}:${token}`);
    await this.cacheManager.del(`${ResetPasswordKey.USER}:${email}`);
    return 'Password resettata con successo.';
  }

  async logout(oldJti: string): Promise<string> {
    // Elimina il vecchio refreshToken dalla cache Redis
    await this.cacheManager.del(`${JwtKey.REFRESH}:${oldJti}`);
    return 'Logout effettuato con successo.';
  }

  private async validateOtp(
    code: string,
    email: string,
    options: { require2faEnabled?: boolean; require2faDisabled?: boolean } = {},
  ): Promise<User> {
    const user = await this.userService.findOne(email);

    if (!user) throw new NotFoundException('Utente non trovato.');

    // Se 2FA deve essere abilitato
    if (options.require2faEnabled && !user.is2faEnabled) {
      throw new BadRequestException('2FA non è abilitato per questo utente.');
    }

    // Se 2FA deve essere disabilitato
    if (options.require2faDisabled && user.is2faEnabled) {
      throw new BadRequestException('2FA è già abilitata per questo utente.');
    }

    if (!user.otpSecret) {
      throw new BadRequestException('OTP Secret non trovato.');
    }

    const decryptedSecret = this.encryptionService.decrypt(user.otpSecret);

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) throw new UnauthorizedException('Codice OTP non valido.');

    return user;
  }

  private async generateToken(email: string): Promise<string> {
    // Controlla se esiste un token vecchio e lo cancella
    const oldToken = await this.cacheManager.get<string>(
      `${ResetPasswordKey.USER}:${email}`,
    );
    if (oldToken) {
      await this.cacheManager.del(`${ResetPasswordKey.TOKEN}:${oldToken}`);
    }

    // Genera nuovo token
    const token = randomBytes(32).toString('hex');

    // Imposta token e user mapping nella cache
    const ttl = 5 * 60 * 1000; // 5 minuti in ms
    await this.cacheManager.set(
      `${ResetPasswordKey.TOKEN}:${token}`,
      email,
      ttl,
    );
    await this.cacheManager.set(
      `${ResetPasswordKey.USER}:${email}`,
      token,
      ttl,
    );

    return token;
  }
}
