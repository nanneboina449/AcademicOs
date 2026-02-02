import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      name: 'AcademicOS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  async getDetailedHealth() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      name: 'AcademicOS API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
