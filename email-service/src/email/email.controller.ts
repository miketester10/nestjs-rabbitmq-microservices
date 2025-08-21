import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';

@Controller() // I controller nei microservizi non hanno bisogno di un path
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user_created')
  handleUserCreated(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [user_created] ricevuto`);
    this.emailService.sendVerificationEmail(data);
  }
}
