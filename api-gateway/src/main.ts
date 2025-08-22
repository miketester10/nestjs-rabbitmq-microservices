import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { ErrorResponseFilter } from './common/filters/error-response.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Abilita la validazione globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Rimuove proprietà non dichiarate nei DTO
      transform: true, // Trasforma payload in istanze delle classi DTO
    }),
  );

  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalFilters(new ErrorResponseFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
