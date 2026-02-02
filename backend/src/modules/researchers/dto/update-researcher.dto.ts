import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateResearcherDto } from './create-researcher.dto';

export class UpdateResearcherDto extends PartialType(
  OmitType(CreateResearcherDto, ['userId'] as const),
) {}
