import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: <string>this.configService.get('EMAIL_HOST'),
      port: <number>this.configService.get('PORT'),
      secure: true,
      auth: {
        user: <string>this.configService.get('USER_EMAIL'),
        pass: <string>this.configService.get('PASSWORD_APP'),
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
