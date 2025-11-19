import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env } from 'src/config/env.schema';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        useFactory: () => {
          const url = env.RABBITMQ_URL;
          const queue = env.RABBITMQ_QUEUE;

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
