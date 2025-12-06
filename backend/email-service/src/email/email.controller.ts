import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';

@Controller() // I controller nei microservizi non hanno bisogno di un path
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [user_created] ricevuto`);
    await this.emailService.sendEmail(data);
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [user_deleted] ricevuto`);
    await this.emailService.sendEmail(data);
  }

  @EventPattern('forgot.password')
  async handleForgotPassword(@Payload() data: EmailShape) {
    this.logger.debug(`Evento [forgot_password] ricevuto`);
    await this.emailService.sendEmail(data);
  }
}
