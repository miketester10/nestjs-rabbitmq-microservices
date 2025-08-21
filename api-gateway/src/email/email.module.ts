import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const url = <string>configService.get('RABBITMQ_URL');
          const queue = <string>configService.get('RABBITMQ_QUEUE');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: queue,
              queueOptions: { durable: true },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class EmailModule {}
