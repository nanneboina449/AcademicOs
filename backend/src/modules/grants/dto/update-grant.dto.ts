import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGrantDto } from './create-grant.dto';

export class UpdateGrantDto extends PartialType(
  OmitType(CreateGrantDto, ['institutionId', 'researchers'] as const),
) {}
