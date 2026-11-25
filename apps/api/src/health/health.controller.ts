import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthResponse {
  status: 'ok';
  db: 'connected';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const connected = await this.prisma.isHealthy();
    const timestamp = new Date().toISOString();

    if (!connected) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'No se pudo verificar la conexión con PostgreSQL.',
        error: 'Service Unavailable',
        status: 'error',
        db: 'disconnected',
        timestamp,
      });
    }

    return {
      status: 'ok',
      db: 'connected',
      timestamp,
    };
  }
}
