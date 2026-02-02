import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { BulkCreateTimeLogDto } from './dto/bulk-create-time-log.dto';
import { Prisma, TimeCategory, ActivityType } from '@prisma/client';

@Injectable()
export class TimeLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTimeLogDto) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id: dto.researcherId },
    });

    if (!researcher) {
      throw new BadRequestException('Researcher not found');
    }

    if (dto.grantId) {
      const grant = await this.prisma.grant.findUnique({
        where: { id: dto.grantId },
      });
      if (!grant) {
        throw new BadRequestException('Grant not found');
      }
    }

    return this.prisma.timeLog.create({
      data: {
        researcherId: dto.researcherId,
        grantId: dto.grantId,
        date: new Date(dto.date),
        hours: dto.hours,
        activityType: dto.activityType,
        category: dto.category,
        description: dto.description,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        grant: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async bulkCreate(dto: BulkCreateTimeLogDto) {
    const created = await this.prisma.timeLog.createMany({
      data: dto.logs.map((log) => ({
        researcherId: log.researcherId,
        grantId: log.grantId,
        date: new Date(log.date),
        hours: log.hours,
        activityType: log.activityType,
        category: log.category,
        description: log.description,
      })),
    });

    return { count: created.count };
  }

  async findAll(options?: {
    researcherId?: string;
    grantId?: string;
    category?: TimeCategory;
    activityType?: ActivityType;
    fromDate?: Date;
    toDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.TimeLogWhereInput = {
      researcherId: options?.researcherId,
      grantId: options?.grantId,
      category: options?.category,
      activityType: options?.activityType,
      date: {
        gte: options?.fromDate,
        lte: options?.toDate,
      },
    };

    const [logs, total] = await Promise.all([
      this.prisma.timeLog.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 100,
        include: {
          researcher: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
              department: {
                select: { name: true },
              },
            },
          },
          grant: {
            select: { id: true, title: true, funder: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.timeLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      skip: options?.skip || 0,
      take: options?.take || 100,
    };
  }

  async findOne(id: string) {
    const timeLog = await this.prisma.timeLog.findUnique({
      where: { id },
      include: {
        researcher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        grant: true,
      },
    });

    if (!timeLog) {
      throw new NotFoundException(`Time log with ID ${id} not found`);
    }

    return timeLog;
  }

  async update(id: string, dto: UpdateTimeLogDto) {
    await this.findOne(id);

    return this.prisma.timeLog.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        grant: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.timeLog.delete({
      where: { id },
    });
  }

  async getResearcherWeeklyLog(researcherId: string, weekOf: Date) {
    const startOfWeek = new Date(weekOf);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const logs = await this.prisma.timeLog.findMany({
      where: {
        researcherId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        grant: {
          select: { id: true, title: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const byDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        logs: logs.filter(
          (log) => log.date.toISOString().split('T')[0] === date.toISOString().split('T')[0],
        ),
        totalHours: logs
          .filter(
            (log) => log.date.toISOString().split('T')[0] === date.toISOString().split('T')[0],
          )
          .reduce((sum, log) => sum + Number(log.hours), 0),
      };
    });

    const totalHours = logs.reduce((sum, log) => sum + Number(log.hours), 0);

    return {
      weekOf: startOfWeek.toISOString().split('T')[0],
      byDay,
      totalHours,
      byCategory: this.groupByCategory(logs),
    };
  }

  async getAdminTimeBreakdown(options: {
    institutionId?: string;
    departmentId?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const adminActivities = [
      'ADMIN_GRANT_WRITING',
      'ADMIN_GRANT_BUDGETING',
      'ADMIN_GRANT_REPORTING',
      'ADMIN_GRANT_COMPLIANCE',
      'ADMIN_GRANT_REVIEW',
      'ADMIN_MEETINGS',
      'ADMIN_EMAILS',
      'ADMIN_COMMITTEES',
      'ADMIN_HR_RECRUITMENT',
      'ADMIN_FINANCE',
      'ADMIN_ETHICS_APPROVAL',
      'ADMIN_DATA_MANAGEMENT',
    ];

    const where: Prisma.TimeLogWhereInput = {
      activityType: { in: adminActivities as ActivityType[] },
      date: {
        gte: options.fromDate || new Date(new Date().getFullYear(), 0, 1),
        lte: options.toDate || new Date(),
      },
      researcher: {
        institutionId: options.institutionId,
        departmentId: options.departmentId,
      },
    };

    const [byActivity, totalAdmin, totalAll] = await Promise.all([
      this.prisma.timeLog.groupBy({
        by: ['activityType'],
        where,
        _sum: { hours: true },
        _count: { id: true },
        orderBy: { _sum: { hours: 'desc' } },
      }),
      this.prisma.timeLog.aggregate({
        where,
        _sum: { hours: true },
      }),
      this.prisma.timeLog.aggregate({
        where: {
          date: where.date,
          researcher: where.researcher,
        },
        _sum: { hours: true },
      }),
    ]);

    const totalAdminHours = Number(totalAdmin._sum.hours) || 0;
    const totalAllHours = Number(totalAll._sum.hours) || 0;
    const adminPercentage = totalAllHours > 0 ? (totalAdminHours / totalAllHours) * 100 : 0;

    return {
      totalAdminHours,
      totalAllHours,
      adminPercentage,
      byActivity: byActivity.map((a) => ({
        activityType: a.activityType,
        hours: Number(a._sum.hours),
        count: a._count.id,
        percentage: totalAdminHours > 0 ? (Number(a._sum.hours) / totalAdminHours) * 100 : 0,
      })),
    };
  }

  private groupByCategory(logs: { category: TimeCategory; hours: Prisma.Decimal }[]) {
    const grouped = logs.reduce(
      (acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + Number(log.hours);
        return acc;
      },
      {} as Record<TimeCategory, number>,
    );

    return Object.entries(grouped).map(([category, hours]) => ({
      category,
      hours,
    }));
  }
}
