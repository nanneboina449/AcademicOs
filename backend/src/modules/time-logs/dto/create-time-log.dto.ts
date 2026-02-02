import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { TimeCategory, ActivityType } from '@prisma/client';

export class CreateTimeLogDto {
  @ApiProperty({ description: 'Researcher ID' })
  @IsString()
  researcherId: string;

  @ApiPropertyOptional({ description: 'Grant ID (if time is grant-related)' })
  @IsOptional()
  @IsString()
  grantId?: string;

  @ApiProperty({ example: '2024-01-15', description: 'Date of activity' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2.5, description: 'Hours spent' })
  @IsNumber()
  @Min(0.25)
  @Max(24)
  hours: number;

  @ApiProperty({ enum: ActivityType, example: ActivityType.ADMIN_GRANT_WRITING })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiProperty({ enum: TimeCategory, example: TimeCategory.ADMINISTRATION })
  @IsEnum(TimeCategory)
  category: TimeCategory;

  @ApiPropertyOptional({ example: 'Writing methodology section for UKRI grant' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
