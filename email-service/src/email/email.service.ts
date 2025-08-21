import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: <string>configService.get('EMAIL_HOST'),
      port: <number>configService.get('PORT'),
      secure: true,
      auth: {
        user: <string>configService.get('USER_EMAIL'),
        pass: <string>configService.get('PASSWORD_APP'),
      },
    });
  }

  async sendVerificationEmail(emailShape: EmailShape): Promise<void> {
    const from = <string>this.configService.get('USER_EMAIL');
    const { recipients, subject, html } = emailShape;

    try {
      await this.transporter.sendMail({
        from: `"Support Team" <${from}>`,
        to: recipients,
        subject: subject,
        html: html,
      });

      this.logger.log(`Email inviata a ${recipients.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Errore invio email a ${recipients.join(', ')}: ${(error as Error).message}`,
      );
    }
  }
}
