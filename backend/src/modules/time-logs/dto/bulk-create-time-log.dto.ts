import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTimeLogDto } from './create-time-log.dto';

export class BulkCreateTimeLogDto {
  @ApiProperty({ type: [CreateTimeLogDto], description: 'Array of time logs to create' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateTimeLogDto)
  logs: CreateTimeLogDto[];
}
