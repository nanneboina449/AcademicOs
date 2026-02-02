import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response, Express } from 'express';
import { AppModule } from '../src/app.module';

let cachedApp: INestApplication | null = null;
let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();

  // Root health check (before NestJS handles routes)
  expressApp.get('/', (req, res) => {
    res.json({
      status: 'ok',
      name: 'AcademicOS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/docs',
      api: '/api/v1',
    });
  });

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] }
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  cachedApp = app;
  cachedServer = expressApp;

  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  try {
    const server = await bootstrap();
    server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
