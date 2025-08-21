import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const url = <string>configService.get('RABBITMQ_URL');
  const queue = <string>configService.get('RABBITMQ_QUEUE');

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
