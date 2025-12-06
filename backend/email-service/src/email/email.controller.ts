import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { Event } from 'src/common/enums/event.enum';

@Controller() // I controller nei microservizi non hanno bisogno di un path
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern(Event.USER_CREATED)
  async handleUserCreated(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [${Event.USER_CREATED}] ricevuto`);
    await this.emailService.sendEmail(data);
  }

  @EventPattern(Event.USER_DELETED)
  async handleUserDeleted(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [${Event.USER_DELETED}] ricevuto`);
    await this.emailService.sendEmail(data);
  }

  @EventPattern(Event.FORGOT_PASSWORD)
  async handleForgotPassword(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [${Event.FORGOT_PASSWORD}] ricevuto`);
    await this.emailService.sendEmail(data);
  }
}
