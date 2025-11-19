import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { env } from './config/env.schema';

async function bootstrap() {
  const url = env.RABBITMQ_URL;
  const queue = env.RABBITMQ_QUEUE;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: queue,
        queueOptions: { durable: true },
      },
    },
  );
  await app.listen();
}
void bootstrap();
