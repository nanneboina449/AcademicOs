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
import { ResearchersService } from './researchers.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('researchers')
@Controller({ path: 'researchers', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResearchersController {
  constructor(private readonly researchersService: ResearchersService) {}

  @Post()
  @ApiOperation({ summary: 'Create researcher profile' })
  @ApiResponse({ status: 201, description: 'Researcher profile created' })
  create(@Body() dto: CreateResearcherDto) {
    return this.researchersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all researchers' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'position', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of researchers' })
  findAll(
    @Query('institutionId') institutionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('position') position?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.researchersService.findAll({
      institutionId,
      departmentId,
      position,
      skip,
      take,
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user researcher profile' })
  @ApiResponse({ status: 200, description: 'Researcher profile' })
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.researchersService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get researcher by ID' })
  @ApiResponse({ status: 200, description: 'Researcher details' })
  @ApiResponse({ status: 404, description: 'Researcher not found' })
  findOne(@Param('id') id: string) {
    return this.researchersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update researcher profile' })
  @ApiResponse({ status: 200, description: 'Researcher updated' })
  update(@Param('id') id: string, @Body() dto: UpdateResearcherDto) {
    return this.researchersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete researcher profile' })
  @ApiResponse({ status: 200, description: 'Researcher deleted' })
  remove(@Param('id') id: string) {
    return this.researchersService.remove(id);
  }

  @Get(':id/time-allocation')
  @ApiOperation({ summary: 'Get researcher time allocation analytics' })
  @ApiQuery({ name: 'from', required: false, type: Date })
  @ApiQuery({ name: 'to', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Time allocation breakdown' })
  getTimeAllocation(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.researchersService.getTimeAllocation(id, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
