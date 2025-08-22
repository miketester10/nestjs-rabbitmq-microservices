import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { verificationEmailTemplate } from 'src/email/templates/verification-email';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EmailVerifyKey } from 'src/common/enums/cache-keys.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const { firstName, lastName, email, password } = createUserDto;

    // Controlla se l'email è già registrata
    const userExist = await this.userRepository.findOne({ where: { email } });
    if (userExist) throw new BadRequestException('Email già registrata.');

    // Crea nuovo utente
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await this.userRepository.save(user);

    // Invia email di verifica
    await this.sendVerificationEmail(user.id, user.firstName, user.email);
    return 'User registrato con successo. Un link di verifica è stato inviato alla tua email.';
  }

  async verifyEmail(token: string): Promise<string> {
    // Recupera userId dalla cache usando il token
    const userId = await this.cacheManager.get<number>(
      `${EmailVerifyKey.TOKEN}:${token}`,
    );
    if (!userId) {
      throw new BadRequestException('Token invalido o scaduto.');
    }

    // Controlla se l'utente esiste
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utente non trovato.');

    // Aggiorna lo stato di verifica dell'utente
    await this.userRepository.update(userId, { isVerified: true });

    // Elimina token e user mapping dalla cache
    await this.cacheManager.del(`${EmailVerifyKey.TOKEN}:${token}`);
    await this.cacheManager.del(`${EmailVerifyKey.USER}:${userId}`);
    return 'Email verificata con successo.';
  }

  async resendVerificationEmail(email: string): Promise<string> {
    // Controlla se l'utente esiste e non è già verificato
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Email non registrata.');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email già verificata.');
    }

    // Invia nuovamente l'email di verifica
    await this.sendVerificationEmail(user.id, user.firstName, user.email);
    return 'Un link di verifica è stato rinviato alla tua email.';
  }

  private async sendVerificationEmail(
    userId: number,
    firstname: string,
    email: string,
  ): Promise<void> {
    // Genera token di verifica
    const token = await this.generateToken(userId);

    // Costruisci link di verifica
    const baseUrl = this.configService.get<string>('BASE_URL_VERIFY_EMAIL');
    const verificationLink = `${baseUrl}?token=${token}`;

    // Costruisci email
    const emailShape: EmailShape = {
      recipients: [email],
      subject: 'Verifica la tua email',
      html: verificationEmailTemplate(firstname, verificationLink),
    };

    // Invia email tramite il microservizio via RabbitMQ
    this.logger.debug(`Evento [user_created] emesso`);
    this.client.emit('user.created', emailShape);
  }

  private async generateToken(userId: number): Promise<string> {
    // Controlla se esiste un token vecchio e lo cancella
    const oldToken = await this.cacheManager.get<string>(
      `${EmailVerifyKey.USER}:${userId}`,
    );
    if (oldToken) {
      await this.cacheManager.del(`${EmailVerifyKey.TOKEN}:${oldToken}`);
    }

    // Genera nuovo token
    const token = randomBytes(32).toString('hex');

    // Imposta token e user mapping nella cache
    const ttl = 5 * 60 * 1000; // 5 minuti in ms
    await this.cacheManager.set(
      `${EmailVerifyKey.TOKEN}:${token}`,
      userId,
      ttl,
    );
    await this.cacheManager.set(`${EmailVerifyKey.USER}:${userId}`, token, ttl);

    return token;
  }
}
