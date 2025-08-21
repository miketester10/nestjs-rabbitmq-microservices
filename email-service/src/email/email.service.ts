import { Injectable, Logger } from '@nestjs/common';

import { EmailShape } from 'src/common/interfaces/email-shape.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {}

  sendVerificationEmail(email: EmailShape) {
    this.logger.log(`Email inviata a ${email.to}`);
  }
}
