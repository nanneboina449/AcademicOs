import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGrantDto } from './dto/create-grant.dto';
import { UpdateGrantDto } from './dto/update-grant.dto';
import { AddResearcherToGrantDto } from './dto/add-researcher-to-grant.dto';
import { Prisma, GrantStatus, FunderType } from '@prisma/client';

@Injectable()
export class GrantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGrantDto) {
    const { researchers, ...grantData } = dto;

    return this.prisma.grant.create({
      data: {
        ...grantData,
        researchers: researchers
          ? {
              create: researchers.map((r) => ({
                researcherId: r.researcherId,
                role: r.role,
                allocation: r.allocation,
              })),
            }
          : undefined,
      },
      include: {
        institution: {
          select: { id: true, name: true, shortName: true },
        },
        researchers: {
          include: {
            researcher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(options?: {
    institutionId?: string;
    status?: GrantStatus;
    funderType?: FunderType;
    researcherId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.GrantWhereInput = {
      institutionId: options?.institutionId,
      status: options?.status,
      funderType: options?.funderType,
      researchers: options?.researcherId
        ? { some: { researcherId: options.researcherId } }
        : undefined,
    };

    const [grants, total] = await Promise.all([
      this.prisma.grant.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
        include: {
          institution: {
            select: { id: true, name: true, shortName: true },
          },
          researchers: {
            include: {
              researcher: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { timeLogs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.grant.count({ where }),
    ]);

    return {
      data: grants,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50,
    };
  }

  async findOne(id: string) {
    const grant = await this.prisma.grant.findUnique({
      where: { id },
      include: {
        institution: true,
        researchers: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                department: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        timeLogs: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            researcher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!grant) {
      throw new NotFoundException(`Grant with ID ${id} not found`);
    }

    return grant;
  }

  async update(id: string, dto: UpdateGrantDto) {
    await this.findOne(id);

    return this.prisma.grant.update({
      where: { id },
      data: dto,
      include: {
        institution: {
          select: { id: true, name: true },
        },
        researchers: {
          include: {
            researcher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.grant.delete({
      where: { id },
    });
  }

  async addResearcher(grantId: string, dto: AddResearcherToGrantDto) {
    await this.findOne(grantId);

    return this.prisma.grantResearcher.create({
      data: {
        grantId,
        researcherId: dto.researcherId,
        role: dto.role,
        allocation: dto.allocation,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }

  async removeResearcher(grantId: string, researcherId: string) {
    return this.prisma.grantResearcher.delete({
      where: {
        grantId_researcherId: {
          grantId,
          researcherId,
        },
      },
    });
  }

  async getSuccessRate(options?: {
    institutionId?: string;
    funderType?: FunderType;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: Prisma.GrantWhereInput = {
      institutionId: options?.institutionId,
      funderType: options?.funderType,
      decisionDate: {
        gte: options?.fromDate,
        lte: options?.toDate,
      },
      status: { in: [GrantStatus.AWARDED, GrantStatus.REJECTED] },
    };

    const [awarded, total] = await Promise.all([
      this.prisma.grant.count({
        where: { ...where, status: GrantStatus.AWARDED },
      }),
      this.prisma.grant.count({ where }),
    ]);

    const successRate = total > 0 ? (awarded / total) * 100 : 0;

    const byFunder = await this.prisma.grant.groupBy({
      by: ['funderType'],
      where,
      _count: { id: true },
    });

    return {
      successRate,
      awarded,
      rejected: total - awarded,
      total,
      byFunder,
    };
  }

  async getTimeSpent(grantId: string) {
    await this.findOne(grantId);

    const timeByActivity = await this.prisma.timeLog.groupBy({
      by: ['activityType'],
      where: { grantId },
      _sum: { hours: true },
      orderBy: { _sum: { hours: 'desc' } },
    });

    const timeByResearcher = await this.prisma.timeLog.groupBy({
      by: ['researcherId'],
      where: { grantId },
      _sum: { hours: true },
    });

    const total = await this.prisma.timeLog.aggregate({
      where: { grantId },
      _sum: { hours: true },
    });

    return {
      totalHours: Number(total._sum.hours) || 0,
      byActivity: timeByActivity.map((t) => ({
        activityType: t.activityType,
        hours: Number(t._sum.hours),
      })),
      byResearcher: timeByResearcher.map((t) => ({
        researcherId: t.researcherId,
        hours: Number(t._sum.hours),
      })),
    };
  }
}
