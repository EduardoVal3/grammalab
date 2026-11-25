import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { parseCorsOrigins } from './common/config/cors.util';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const { httpAdapter } = app.get(HttpAdapterHost);

  const port = Number(config.get<string>('PORT', '3000'));
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const corsOrigins = parseCorsOrigins(config.get<string>('CORS_ORIGIN'), nodeEnv);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));
  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`GrammaLab API corriendo en http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
