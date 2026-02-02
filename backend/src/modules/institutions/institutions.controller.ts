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
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('institutions')
@Controller({ path: 'institutions', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new institution' })
  @ApiResponse({ status: 201, description: 'Institution created successfully' })
  create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all institutions' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'List of institutions' })
  findAll(
    @Query('country') country?: string,
    @Query('type') type?: string,
  ) {
    return this.institutionsService.findAll({ country, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institution by ID' })
  @ApiResponse({ status: 200, description: 'Institution details' })
  @ApiResponse({ status: 404, description: 'Institution not found' })
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update institution' })
  @ApiResponse({ status: 200, description: 'Institution updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate institution' })
  @ApiResponse({ status: 200, description: 'Institution deactivated' })
  remove(@Param('id') id: string) {
    return this.institutionsService.remove(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get institution statistics' })
  @ApiResponse({ status: 200, description: 'Institution statistics' })
  getStats(@Param('id') id: string) {
    return this.institutionsService.getStats(id);
  }

  @Post(':id/departments')
  @ApiOperation({ summary: 'Add department to institution' })
  @ApiResponse({ status: 201, description: 'Department added' })
  addDepartment(
    @Param('id') id: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.institutionsService.addDepartment(id, dto);
  }

  @Get(':id/departments')
  @ApiOperation({ summary: 'Get institution departments' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  getDepartments(@Param('id') id: string) {
    return this.institutionsService.getDepartments(id);
  }
}
