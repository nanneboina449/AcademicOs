import { Module } from '@nestjs/common';
import { ResearchersService } from './researchers.service';
import { ResearchersController } from './researchers.controller';

@Module({
  controllers: [ResearchersController],
  providers: [ResearchersService],
  exports: [ResearchersService],
})
export class ResearchersModule {}
