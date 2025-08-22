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
      host: this.configService.get<string>('HOST'),
      port: Number(this.configService.get<string>('PORT')),
      secure: true,
      auth: {
        user: this.configService.get<string>('USER_EMAIL'),
        pass: this.configService.get<string>('PASSWORD_APP'),
      },
    });
  }

  async sendVerificationEmail(emailShape: EmailShape): Promise<void> {
    const from = this.configService.get<string>('USER_EMAIL');
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
