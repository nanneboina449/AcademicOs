import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  getDashboardStats(
    @Query('institutionId') institutionId?: string,
    @CurrentUser('institutionId') userInstitutionId?: string,
  ) {
    return this.analyticsService.getDashboardStats(
      institutionId || userInstitutionId,
    );
  }

  @Get('time-trends')
  @ApiOperation({ summary: 'Get time allocation trends over months' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Time allocation trends' })
  getTimeTrends(
    @Query('institutionId') institutionId?: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getTimeAllocationTrends({
      institutionId,
      months,
    });
  }

  @Get('bottlenecks')
  @ApiOperation({ summary: 'Get top admin bottlenecks' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top admin bottlenecks' })
  getBottlenecks(
    @Query('institutionId') institutionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopAdminBottlenecks({
      institutionId,
      departmentId,
      limit,
    });
  }

  @Get('researcher-comparison')
  @ApiOperation({ summary: 'Compare researchers time allocation' })
  @ApiQuery({ name: 'institutionId', required: true })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200, description: 'Researcher comparison data' })
  getResearcherComparison(
    @Query('institutionId') institutionId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getResearcherComparison({
      institutionId,
      departmentId,
    });
  }

  @Get('grant-pipeline')
  @ApiOperation({ summary: 'Get grant pipeline analytics' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiResponse({ status: 200, description: 'Grant pipeline analytics' })
  getGrantPipeline(@Query('institutionId') institutionId?: string) {
    return this.analyticsService.getGrantPipelineAnalytics(institutionId);
  }

  @Get('benchmarks')
  @ApiOperation({ summary: 'Get sector benchmarks comparison' })
  @ApiQuery({ name: 'institutionId', required: true })
  @ApiResponse({ status: 200, description: 'Sector benchmarks' })
  getBenchmarks(@Query('institutionId') institutionId: string) {
    return this.analyticsService.getSectorBenchmarks(institutionId);
  }
}
