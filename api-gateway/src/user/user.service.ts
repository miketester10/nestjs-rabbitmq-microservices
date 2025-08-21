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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
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

    this.sendVerificationEmail(user.id, user.email);

    return {
      message:
        'User registrato con successo. Un link di verifica è stato inviato alla tua email.',
    };
  }

  private sendVerificationEmail(userId: number, email: string): void {
    const verificationLink = `http://localhost:3000/users/verify-email?token=xxxxxxxxxxx`;

    const emailShape: EmailShape = {
      to: email,
      subject: 'Verifica la tua email',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Ciao,</p>
            <p>clicca sul link qui sotto per verificare la tua email:</p>
            <p><a href="${verificationLink}">Verifica Email</a></p>
            <p>Se non ti sei registrato, ignora questa email.</p>
        </div>
        `,
    };
    this.logger.debug(`Evento [user_created] emesso`);
    this.client.emit('user_created', emailShape);
  }
}
