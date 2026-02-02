import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: dto,
      include: {
        departments: true,
      },
    });
  }

  async findAll(options?: {
    country?: string;
    type?: string;
    isActive?: boolean;
  }) {
    return this.prisma.institution.findMany({
      where: {
        country: options?.country,
        type: options?.type as any,
        isActive: options?.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            users: true,
            researchers: true,
            grants: true,
            departments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        departments: true,
        _count: {
          select: {
            users: true,
            researchers: true,
            grants: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    return institution;
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);

    return this.prisma.institution.update({
      where: { id },
      data: dto,
      include: {
        departments: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.institution.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(id: string) {
    await this.findOne(id);

    const [researcherCount, grantStats, timeLogStats] = await Promise.all([
      this.prisma.researcher.count({
        where: { institutionId: id },
      }),
      this.prisma.grant.groupBy({
        by: ['status'],
        where: { institutionId: id },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.timeLog.groupBy({
        by: ['category'],
        where: {
          researcher: { institutionId: id },
        },
        _sum: { hours: true },
      }),
    ]);

    return {
      researcherCount,
      grantStats,
      timeLogStats,
    };
  }

  async addDepartment(institutionId: string, data: { name: string; code?: string; faculty?: string }) {
    await this.findOne(institutionId);

    return this.prisma.department.create({
      data: {
        ...data,
        institutionId,
      },
    });
  }

  async getDepartments(institutionId: string) {
    await this.findOne(institutionId);

    return this.prisma.department.findMany({
      where: { institutionId },
      include: {
        _count: {
          select: { researchers: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
