import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateResearcherDto {
  @ApiProperty({ description: 'User ID to link researcher profile' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Institution ID' })
  @IsString()
  institutionId: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: '0000-0002-1825-0097' })
  @IsOptional()
  @IsString()
  orcidId?: string;

  @ApiPropertyOptional({ example: 'Dr.' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Senior Lecturer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: ['Machine Learning', 'Natural Language Processing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  researchAreas?: string[];

  @ApiPropertyOptional({ enum: ContractType, default: ContractType.PERMANENT })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ example: 1.0, description: 'Full-time equivalent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  fte?: number;
}
