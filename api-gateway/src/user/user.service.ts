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

  async register(createUserDto: CreateUserDto): Promise<void> {
    const { firstName, lastName, email, password } = createUserDto;

    const userExist = await this.userRepository.findOne({ where: { email } });
    if (userExist) throw new BadRequestException('Email già registrata.');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await this.userRepository.save(user);
    await this.sendVerificationEmail(user.id, user.firstName, user.email);
  }

  async verifyEmail(token: string): Promise<void> {
    const userId = await this.cacheManager.get<number>(
      `email_verify:token:${token}`,
    );
    if (!userId) {
      throw new BadRequestException('Token invalido o scaduto');
    }

    await this.userRepository.update(userId, { isVerified: true });

    // Elimina token e user mapping dalla cache
    await this.cacheManager.del(`email_verify:token:${token}`);
    await this.cacheManager.del(`email_verify:user:${userId}`);
  }

  private async sendVerificationEmail(
    userId: number,
    firstname: string,
    email: string,
  ): Promise<void> {
    const token = await this.generateToken(userId);

    const baseUrl = this.configService.get<string>('BASE_URL_VERIFY_EMAIL');
    const verificationLink = `${baseUrl}?token=${token}`;

    const emailShape: EmailShape = {
      recipients: [email],
      subject: 'Verifica la tua email',
      html: verificationEmailTemplate(firstname, verificationLink),
    };

    this.logger.debug(`Evento [user_created] emesso`);
    this.client.emit('user.created', emailShape);
  }

  private async generateToken(userId: number): Promise<string> {
    // Controlla se esiste un token vecchio e lo cancella
    const oldToken = await this.cacheManager.get<string>(
      `email_verify:user:${userId}`,
    );
    if (oldToken) {
      await this.cacheManager.del(`email_verify:token:${oldToken}`);
    }

    // Genera nuovo token
    const token = randomBytes(32).toString('hex');

    // Imposta token e user mapping nella cache
    const ttl = 5 * 60 * 1000;
    await this.cacheManager.set(`email_verify:token:${token}`, userId, ttl);
    await this.cacheManager.set(`email_verify:user:${userId}`, token, ttl);

    return token;
  }
}
