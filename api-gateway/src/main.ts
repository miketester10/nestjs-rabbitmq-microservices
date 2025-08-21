import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Abilita la validazione globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Rimuove proprietà non dichiarate nei DTO
      transform: true, // Trasforma payload in istanze delle classi DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
