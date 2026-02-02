import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { InstitutionType, SubscriptionTier } from '@prisma/client';

export class CreateInstitutionDto {
  @ApiProperty({ example: 'University of Oxford' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Oxford' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shortName?: string;

  @ApiProperty({ enum: InstitutionType, example: InstitutionType.RUSSELL_GROUP })
  @IsEnum(InstitutionType)
  type: InstitutionType;

  @ApiPropertyOptional({ example: 'UK', default: 'UK' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ example: 'South East England' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ example: 'https://www.ox.ac.uk' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ enum: SubscriptionTier, default: SubscriptionTier.FREE })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier;
}
