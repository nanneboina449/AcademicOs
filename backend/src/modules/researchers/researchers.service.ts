import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ResearchersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateResearcherDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingResearcher = await this.prisma.researcher.findUnique({
      where: { userId: dto.userId },
    });

    if (existingResearcher) {
      throw new BadRequestException('Researcher profile already exists for this user');
    }

    return this.prisma.researcher.create({
      data: {
        userId: dto.userId,
        institutionId: dto.institutionId,
        departmentId: dto.departmentId,
        orcidId: dto.orcidId,
        title: dto.title,
        position: dto.position,
        researchAreas: dto.researchAreas || [],
        contractType: dto.contractType,
        fte: dto.fte,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(options?: {
    institutionId?: string;
    departmentId?: string;
    position?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.ResearcherWhereInput = {
      institutionId: options?.institutionId,
      departmentId: options?.departmentId,
      position: options?.position ? { contains: options.position, mode: 'insensitive' } : undefined,
    };

    const [researchers, total] = await Promise.all([
      this.prisma.researcher.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              timeLogs: true,
              grants: true,
            },
          },
        },
        orderBy: [
          { user: { lastName: 'asc' } },
          { user: { firstName: 'asc' } },
        ],
      }),
      this.prisma.researcher.count({ where }),
    ]);

    return {
      data: researchers,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50,
    };
  }

  async findOne(id: string) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            shortName: true,
            type: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            faculty: true,
          },
        },
        grants: {
          include: {
            grant: {
              select: {
                id: true,
                title: true,
                funder: true,
                status: true,
                amount: true,
              },
            },
          },
        },
      },
    });

    if (!researcher) {
      throw new NotFoundException(`Researcher with ID ${id} not found`);
    }

    return researcher;
  }

  async findByUserId(userId: string) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        institution: true,
        department: true,
      },
    });

    if (!researcher) {
      throw new NotFoundException(`Researcher profile not found for user ${userId}`);
    }

    return researcher;
  }

  async update(id: string, dto: UpdateResearcherDto) {
    await this.findOne(id);

    return this.prisma.researcher.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        institution: true,
        department: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.researcher.delete({
      where: { id },
    });
  }

  async getTimeAllocation(id: string, options?: { from?: Date; to?: Date }) {
    await this.findOne(id);

    const where: Prisma.TimeLogWhereInput = {
      researcherId: id,
      date: {
        gte: options?.from || new Date(new Date().getFullYear(), 0, 1),
        lte: options?.to || new Date(),
      },
    };

    const [byCategory, byActivity, totalHours] = await Promise.all([
      this.prisma.timeLog.groupBy({
        by: ['category'],
        where,
        _sum: { hours: true },
      }),
      this.prisma.timeLog.groupBy({
        by: ['activityType'],
        where,
        _sum: { hours: true },
        orderBy: { _sum: { hours: 'desc' } },
        take: 10,
      }),
      this.prisma.timeLog.aggregate({
        where,
        _sum: { hours: true },
      }),
    ]);

    const total = Number(totalHours._sum.hours) || 0;

    return {
      byCategory: byCategory.map((c) => ({
        category: c.category,
        hours: Number(c._sum.hours),
        percentage: total > 0 ? (Number(c._sum.hours) / total) * 100 : 0,
      })),
      byActivity: byActivity.map((a) => ({
        activityType: a.activityType,
        hours: Number(a._sum.hours),
        percentage: total > 0 ? (Number(a._sum.hours) / total) * 100 : 0,
      })),
      totalHours: total,
    };
  }
}
