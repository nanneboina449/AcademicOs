import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GrantStatus, FunderType, GrantRole } from '@prisma/client';

class GrantResearcherInput {
  @ApiProperty()
  @IsString()
  researcherId: string;

  @ApiProperty({ enum: GrantRole })
  @IsEnum(GrantRole)
  role: GrantRole;

  @ApiPropertyOptional({ example: 50, description: 'Percentage allocation' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocation?: number;
}

export class CreateGrantDto {
  @ApiProperty({ example: 'AI for Climate Change Research' })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ example: 'UKRI-2024-001' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'UKRI' })
  @IsString()
  funder: string;

  @ApiProperty({ enum: FunderType })
  @IsEnum(FunderType)
  funderType: FunderType;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'GBP', default: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: GrantStatus, default: GrantStatus.DRAFT })
  @IsOptional()
  @IsEnum(GrantStatus)
  status?: GrantStatus;

  @ApiPropertyOptional({ example: '2024-04-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2024-02-15' })
  @IsOptional()
  @IsDateString()
  submissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Institution ID' })
  @IsString()
  institutionId: string;

  @ApiPropertyOptional({ type: [GrantResearcherInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrantResearcherInput)
  researchers?: GrantResearcherInput[];
}
