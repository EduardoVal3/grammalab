import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { parseCorsOrigins } from '../common/config/cors.util';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController & Base API Config', () => {
  let app: INestApplication;
  const prismaMock = {
    isHealthy: jest.fn<Promise<boolean>, []>(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prismaMock }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prismaMock.isHealthy.mockReset();
  });

  it('GET /api/health retorna 200 OK cuando PostgreSQL responde', async () => {
    prismaMock.isHealthy.mockResolvedValue(true);

    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      db: 'connected',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('GET /api/health retorna 503 cuando PostgreSQL no está disponible', async () => {
    prismaMock.isHealthy.mockResolvedValue(false);

    const response = await request(app.getHttpServer()).get('/api/health').expect(503);

    expect(response.body).toMatchObject({
      statusCode: 503,
      status: 'error',
      db: 'disconnected',
    });
  });

  it('parseCorsOrigins filtra comodines y respeta el entorno', () => {
    expect(parseCorsOrigins('http://localhost:5173, https://grammalab.vercel.app')).toEqual([
      'http://localhost:5173',
      'https://grammalab.vercel.app',
    ]);
    expect(parseCorsOrigins('*', 'production')).toEqual([]);
    expect(parseCorsOrigins(undefined, 'development')).toEqual(['http://localhost:5173']);
  });
});
