import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { verificationEmailTemplate } from 'src/email/templates/verification-email';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { EmailVerifyKey } from 'src/common/enums/cache-keys.enum';
import * as bcrypt from 'bcrypt';
import { env } from 'src/config/env.schema';
import { deleteAccountTemplate } from 'src/email/templates/delete-account';
import { Event } from 'src/common/enums/event.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getProfile(
    email: string,
  ): Promise<{ user: Omit<User, 'password' | 'otpSecret'> }> {
    const user = await this.findOne(email);
    if (!user) throw new NotFoundException('Utente non trovato.');
    const { password, otpSecret, ...rest } = user;
    return { user: rest };
  }

  async update(entity: User, updateDto: Partial<User>): Promise<User> {
    Object.assign(entity, updateDto);
    return this.userRepository.save(entity);
  }

  async register(createUserDto: CreateUserDto): Promise<string> {
    const { firstName, lastName, email, password } = createUserDto;

    // Controlla se l'email è già registrata
    const userExist = await this.findOne(email);
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
    await this.sendVerificationEmail(user.firstName, user.email);
    return 'User registrato con successo. Un link di verifica è stato inviato alla tua email.';
  }

  async sendVerificationEmail(firstname: string, email: string): Promise<void> {
    // Genera token
    const token = await this.generateToken(email);

    // Costruisci link di verifica
    const baseUrl = env.BASE_URL_VERIFY_EMAIL;
    const verificationLink = `${baseUrl}?token=${token}`;

    // Costruisci email
    const emailShape: EmailShape = {
      recipients: [email],
      subject: 'Verifica la tua email',
      html: verificationEmailTemplate(firstname, verificationLink),
    };

    // Invia email tramite il microservizio via RabbitMQ
    this.client.emit(Event.USER_CREATED, emailShape);
    this.logger.debug(`Evento [${Event.USER_CREATED}] emesso`);
  }

  async resendVerificationEmail(email: string): Promise<string> {
    const user = await this.findOne(email);

    if (user) {
      if (!user.isVerified) {
        // Invia nuovamente l'email di verifica
        await this.sendVerificationEmail(user.firstName, user.email);
      } else {
        // Logga un avviso se l'utente è già verificato
        this.logger.debug(`L'utente con email ${email} è già verificato.`);
      }
    } else {
      // Logga un avviso se l'utente non esiste
      this.logger.warn(`Nessun account trovato con email ${email}.`);
    }

    // Risposta generica per motivi di sicurezza (contro enumeration attack)
    return "Se c'è un account registrato con questa e-mail, ti invieremo il link per verificarlo a questo indirizzo.";
  }

  async verifyEmail(token: string): Promise<string> {
    // Recupera email dalla cache usando il token
    const email = await this.cacheManager.get<string>(
      `${EmailVerifyKey.TOKEN}:${token}`,
    );
    if (!email) {
      throw new BadRequestException('Token invalido o scaduto.');
    }

    // Controlla se l'utente esiste
    const user = await this.findOne(email);
    if (!user) throw new NotFoundException('Utente non trovato.');

    // Aggiorna lo stato dell'utente a verificato
    await this.userRepository.update(
      { email },
      {
        isVerified: true,
      },
    );

    // Elimina token e user mapping dalla cache
    await this.cacheManager.del(`${EmailVerifyKey.TOKEN}:${token}`);
    await this.cacheManager.del(`${EmailVerifyKey.USER}:${email}`);
    return 'Email verificata con successo.';
  }

  async deleteAccount(email: string): Promise<void> {
    const user = await this.findOne(email);
    if (!user) throw new NotFoundException('Utente non trovato.');
    await this.userRepository.delete(user.id);

    // Invia email di conferma eliminazione account
    this.sendDeleteAccountEmail(user.firstName, user.email);
  }

  sendDeleteAccountEmail(firstname: string, email: string): void {
    // Costruisci email
    const emailShape: EmailShape = {
      recipients: [email],
      subject: 'Conferma eliminazione account',
      html: deleteAccountTemplate(firstname),
    };

    // Invia email tramite il microservizio via RabbitMQ
    this.client.emit(Event.USER_DELETED, emailShape);
    this.logger.debug(`Evento [${Event.USER_DELETED}] emesso`);
  }

  private async generateToken(email: string): Promise<string> {
    // Controlla se esiste un token vecchio e lo cancella
    const oldToken = await this.cacheManager.get<string>(
      `${EmailVerifyKey.USER}:${email}`,
    );
    if (oldToken) {
      await this.cacheManager.del(`${EmailVerifyKey.TOKEN}:${oldToken}`);
    }

    // Genera nuovo token
    const token = randomBytes(32).toString('hex');

    // Imposta token e user mapping nella cache
    const ttl = 5 * 60 * 1000; // 5 minuti in ms
    await this.cacheManager.set(`${EmailVerifyKey.TOKEN}:${token}`, email, ttl);
    await this.cacheManager.set(`${EmailVerifyKey.USER}:${email}`, token, ttl);

    return token;
  }
}
