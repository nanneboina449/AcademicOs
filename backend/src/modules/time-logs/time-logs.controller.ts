import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TimeLogsService } from './time-logs.service';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { BulkCreateTimeLogDto } from './dto/bulk-create-time-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimeCategory, ActivityType } from '@prisma/client';

@ApiTags('time-logs')
@Controller({ path: 'time-logs', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a time log entry' })
  @ApiResponse({ status: 201, description: 'Time log created' })
  create(@Body() dto: CreateTimeLogDto) {
    return this.timeLogsService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple time log entries' })
  @ApiResponse({ status: 201, description: 'Time logs created' })
  bulkCreate(@Body() dto: BulkCreateTimeLogDto) {
    return this.timeLogsService.bulkCreate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all time logs' })
  @ApiQuery({ name: 'researcherId', required: false })
  @ApiQuery({ name: 'grantId', required: false })
  @ApiQuery({ name: 'category', required: false, enum: TimeCategory })
  @ApiQuery({ name: 'activityType', required: false, enum: ActivityType })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of time logs' })
  findAll(
    @Query('researcherId') researcherId?: string,
    @Query('grantId') grantId?: string,
    @Query('category') category?: TimeCategory,
    @Query('activityType') activityType?: ActivityType,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.timeLogsService.findAll({
      researcherId,
      grantId,
      category,
      activityType,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      skip,
      take,
    });
  }

  @Get('weekly/:researcherId')
  @ApiOperation({ summary: 'Get researcher weekly time log' })
  @ApiQuery({ name: 'weekOf', required: false, description: 'Date within the week (defaults to current week)' })
  @ApiResponse({ status: 200, description: 'Weekly time log breakdown' })
  getWeeklyLog(
    @Param('researcherId') researcherId: string,
    @Query('weekOf') weekOf?: string,
  ) {
    return this.timeLogsService.getResearcherWeeklyLog(
      researcherId,
      weekOf ? new Date(weekOf) : new Date(),
    );
  }

  @Get('admin-breakdown')
  @ApiOperation({ summary: 'Get admin time breakdown (bottleneck analysis)' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiResponse({ status: 200, description: 'Admin time breakdown' })
  getAdminBreakdown(
    @Query('institutionId') institutionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.timeLogsService.getAdminTimeBreakdown({
      institutionId,
      departmentId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time log by ID' })
  @ApiResponse({ status: 200, description: 'Time log details' })
  @ApiResponse({ status: 404, description: 'Time log not found' })
  findOne(@Param('id') id: string) {
    return this.timeLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update time log' })
  @ApiResponse({ status: 200, description: 'Time log updated' })
  update(@Param('id') id: string, @Body() dto: UpdateTimeLogDto) {
    return this.timeLogsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete time log' })
  @ApiResponse({ status: 200, description: 'Time log deleted' })
  remove(@Param('id') id: string) {
    return this.timeLogsService.remove(id);
  }
}
