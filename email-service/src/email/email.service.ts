import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EmailShape } from 'src/common/interfaces/email-shape.interface';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env.schema';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: env.HOST,
      port: env.PORT,
      secure: true,
      auth: {
        user: env.USER_EMAIL,
        pass: env.PASSWORD_APP,
      },
    });
  }

  async sendEmail(emailShape: EmailShape): Promise<void> {
    const from = env.USER_EMAIL;
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
