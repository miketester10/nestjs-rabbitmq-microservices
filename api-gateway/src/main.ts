import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { ErrorResponseFilter } from './common/filters/error-response.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Abilita la validazione globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Rimuove proprietà non dichiarate nei DTO
      transform: true, // Trasforma payload in istanze delle classi DTO
    }),
  );

  // Abilita CORS
  app.enableCors();

  // Configura ed abilita Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Microservices via Rabbit MQ (API Gateway)')
    .setDescription(
      'REST API Gateway per la gestione di utenti, costruita con NestJS e microservizi che comunicano tramite RabbitMQ.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Abilita Interceptor e Filter globali
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalFilters(new ErrorResponseFilter());

  // Avvia l'applicazione
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
