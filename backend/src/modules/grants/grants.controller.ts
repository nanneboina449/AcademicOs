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
import { GrantsService } from './grants.service';
import { CreateGrantDto } from './dto/create-grant.dto';
import { UpdateGrantDto } from './dto/update-grant.dto';
import { AddResearcherToGrantDto } from './dto/add-researcher-to-grant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrantStatus, FunderType } from '@prisma/client';

@ApiTags('grants')
@Controller({ path: 'grants', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GrantsController {
  constructor(private readonly grantsService: GrantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grant' })
  @ApiResponse({ status: 201, description: 'Grant created successfully' })
  create(@Body() dto: CreateGrantDto) {
    return this.grantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grants' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: GrantStatus })
  @ApiQuery({ name: 'funderType', required: false, enum: FunderType })
  @ApiQuery({ name: 'researcherId', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of grants' })
  findAll(
    @Query('institutionId') institutionId?: string,
    @Query('status') status?: GrantStatus,
    @Query('funderType') funderType?: FunderType,
    @Query('researcherId') researcherId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.grantsService.findAll({
      institutionId,
      status,
      funderType,
      researcherId,
      skip,
      take,
    });
  }

  @Get('success-rate')
  @ApiOperation({ summary: 'Get grant success rate analytics' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'funderType', required: false, enum: FunderType })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiResponse({ status: 200, description: 'Success rate statistics' })
  getSuccessRate(
    @Query('institutionId') institutionId?: string,
    @Query('funderType') funderType?: FunderType,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.grantsService.getSuccessRate({
      institutionId,
      funderType,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grant by ID' })
  @ApiResponse({ status: 200, description: 'Grant details' })
  @ApiResponse({ status: 404, description: 'Grant not found' })
  findOne(@Param('id') id: string) {
    return this.grantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grant' })
  @ApiResponse({ status: 200, description: 'Grant updated' })
  update(@Param('id') id: string, @Body() dto: UpdateGrantDto) {
    return this.grantsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grant' })
  @ApiResponse({ status: 200, description: 'Grant deleted' })
  remove(@Param('id') id: string) {
    return this.grantsService.remove(id);
  }

  @Post(':id/researchers')
  @ApiOperation({ summary: 'Add researcher to grant' })
  @ApiResponse({ status: 201, description: 'Researcher added to grant' })
  addResearcher(
    @Param('id') id: string,
    @Body() dto: AddResearcherToGrantDto,
  ) {
    return this.grantsService.addResearcher(id, dto);
  }

  @Delete(':id/researchers/:researcherId')
  @ApiOperation({ summary: 'Remove researcher from grant' })
  @ApiResponse({ status: 200, description: 'Researcher removed from grant' })
  removeResearcher(
    @Param('id') id: string,
    @Param('researcherId') researcherId: string,
  ) {
    return this.grantsService.removeResearcher(id, researcherId);
  }

  @Get(':id/time-spent')
  @ApiOperation({ summary: 'Get time spent on grant' })
  @ApiResponse({ status: 200, description: 'Time spent analytics' })
  getTimeSpent(@Param('id') id: string) {
    return this.grantsService.getTimeSpent(id);
  }
}
