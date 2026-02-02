import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { GrantRole } from '@prisma/client';

export class AddResearcherToGrantDto {
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
