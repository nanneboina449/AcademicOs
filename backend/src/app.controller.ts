import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Health Check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed Health Check' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  getDetailedHealth() {
    return this.appService.getDetailedHealth();
  }
}
