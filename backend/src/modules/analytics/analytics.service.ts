import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TimeCategory } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(institutionId?: string) {
    const where = institutionId ? { institutionId } : {};
    const researcherWhere = institutionId ? { researcher: { institutionId } } : {};

    const [
      researcherCount,
      grantCount,
      activeGrants,
      totalTimeLogged,
      adminTimePercentage,
    ] = await Promise.all([
      this.prisma.researcher.count({ where }),
      this.prisma.grant.count({ where }),
      this.prisma.grant.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      this.prisma.timeLog.aggregate({
        where: researcherWhere,
        _sum: { hours: true },
      }),
      this.getAdminTimePercentage(institutionId),
    ]);

    return {
      researcherCount,
      grantCount,
      activeGrants,
      totalTimeLogged: Number(totalTimeLogged._sum.hours) || 0,
      adminTimePercentage,
    };
  }

  async getTimeAllocationTrends(options: {
    institutionId?: string;
    months?: number;
  }) {
    const monthsBack = options.months || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const logs = await this.prisma.$queryRaw<
      Array<{ month: string; category: TimeCategory; hours: number }>
    >`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        category,
        SUM(hours) as hours
      FROM time_logs tl
      JOIN researchers r ON tl.researcher_id = r.id
      WHERE tl.date >= ${startDate}
      ${options.institutionId ? Prisma.sql`AND r.institution_id = ${options.institutionId}` : Prisma.empty}
      GROUP BY TO_CHAR(date, 'YYYY-MM'), category
      ORDER BY month ASC
    `;

    const months = [...new Set(logs.map((l) => l.month))];
    const categories = [...new Set(logs.map((l) => l.category))];

    return {
      months,
      categories,
      data: logs.map((l) => ({
        month: l.month,
        category: l.category,
        hours: Number(l.hours),
      })),
    };
  }

  async getTopAdminBottlenecks(options: {
    institutionId?: string;
    departmentId?: string;
    limit?: number;
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

    const bottlenecks = await this.prisma.timeLog.groupBy({
      by: ['activityType'],
      where: {
        activityType: { in: adminActivities as any },
        researcher: {
          institutionId: options.institutionId,
          departmentId: options.departmentId,
        },
      },
      _sum: { hours: true },
      _count: { id: true },
      orderBy: { _sum: { hours: 'desc' } },
      take: options.limit || 10,
    });

    const totalAdminHours = bottlenecks.reduce(
      (sum, b) => sum + Number(b._sum.hours),
      0,
    );

    return bottlenecks.map((b) => ({
      activityType: b.activityType,
      totalHours: Number(b._sum.hours),
      logCount: b._count.id,
      percentage: totalAdminHours > 0
        ? (Number(b._sum.hours) / totalAdminHours) * 100
        : 0,
    }));
  }

  async getResearcherComparison(options: {
    institutionId: string;
    departmentId?: string;
  }) {
    const researchers = await this.prisma.researcher.findMany({
      where: {
        institutionId: options.institutionId,
        departmentId: options.departmentId,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        timeLogs: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), 0, 1),
            },
          },
        },
      },
    });

    return researchers.map((r) => {
      const totalHours = r.timeLogs.reduce(
        (sum, log) => sum + Number(log.hours),
        0,
      );
      const adminHours = r.timeLogs
        .filter((log) => log.category === 'ADMINISTRATION')
        .reduce((sum, log) => sum + Number(log.hours), 0);

      return {
        id: r.id,
        name: `${r.user.firstName} ${r.user.lastName}`,
        position: r.position,
        totalHours,
        adminHours,
        adminPercentage: totalHours > 0 ? (adminHours / totalHours) * 100 : 0,
        researchHours: r.timeLogs
          .filter((log) => log.category === 'RESEARCH')
          .reduce((sum, log) => sum + Number(log.hours), 0),
        teachingHours: r.timeLogs
          .filter((log) => log.category === 'TEACHING')
          .reduce((sum, log) => sum + Number(log.hours), 0),
      };
    });
  }

  async getGrantPipelineAnalytics(institutionId?: string) {
    const where = institutionId ? { institutionId } : {};

    const [byStatus, byFunder, totalValue, successRate] = await Promise.all([
      this.prisma.grant.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.grant.groupBy({
        by: ['funderType'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.grant.aggregate({
        where: { ...where, status: { in: ['AWARDED', 'ACTIVE'] } },
        _sum: { amount: true },
      }),
      this.calculateSuccessRate(institutionId),
    ]);

    return {
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        totalValue: Number(s._sum.amount) || 0,
      })),
      byFunder: byFunder.map((f) => ({
        funderType: f.funderType,
        count: f._count.id,
        totalValue: Number(f._sum.amount) || 0,
      })),
      totalAwardedValue: Number(totalValue._sum.amount) || 0,
      successRate,
    };
  }

  async getSectorBenchmarks(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return null;
    }

    const benchmarks = await this.prisma.sectorBenchmark.findMany({
      where: { institutionType: institution.type },
      orderBy: { periodStart: 'desc' },
    });

    const currentStats = await this.getInstitutionMetrics(institutionId);

    return {
      institutionType: institution.type,
      currentMetrics: currentStats,
      benchmarks: benchmarks.map((b) => ({
        metric: b.metric,
        yourValue: currentStats[b.metric] || 0,
        percentile25: Number(b.percentile25),
        percentile50: Number(b.percentile50),
        percentile75: Number(b.percentile75),
        sampleSize: b.sampleSize,
      })),
    };
  }

  private async getAdminTimePercentage(institutionId?: string): Promise<number> {
    const where = institutionId
      ? { researcher: { institutionId } }
      : {};

    const [adminTime, totalTime] = await Promise.all([
      this.prisma.timeLog.aggregate({
        where: { ...where, category: 'ADMINISTRATION' },
        _sum: { hours: true },
      }),
      this.prisma.timeLog.aggregate({
        where,
        _sum: { hours: true },
      }),
    ]);

    const admin = Number(adminTime._sum.hours) || 0;
    const total = Number(totalTime._sum.hours) || 0;

    return total > 0 ? (admin / total) * 100 : 0;
  }

  private async calculateSuccessRate(institutionId?: string): Promise<number> {
    const where = institutionId ? { institutionId } : {};

    const [awarded, decided] = await Promise.all([
      this.prisma.grant.count({
        where: { ...where, status: 'AWARDED' },
      }),
      this.prisma.grant.count({
        where: { ...where, status: { in: ['AWARDED', 'REJECTED'] } },
      }),
    ]);

    return decided > 0 ? (awarded / decided) * 100 : 0;
  }

  private async getInstitutionMetrics(
    institutionId: string,
  ): Promise<Record<string, number>> {
    const [adminPercentage, grantSuccessRate, avgResearchHours] =
      await Promise.all([
        this.getAdminTimePercentage(institutionId),
        this.calculateSuccessRate(institutionId),
        this.prisma.timeLog.aggregate({
          where: {
            researcher: { institutionId },
            category: 'RESEARCH',
          },
          _avg: { hours: true },
        }),
      ]);

    return {
      adminTimePercentage: adminPercentage,
      grantSuccessRate,
      avgResearchHoursPerLog: Number(avgResearchHours._avg.hours) || 0,
    };
  }
}
