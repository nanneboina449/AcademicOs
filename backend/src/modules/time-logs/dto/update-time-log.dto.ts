import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTimeLogDto } from './create-time-log.dto';

export class UpdateTimeLogDto extends PartialType(
  OmitType(CreateTimeLogDto, ['researcherId'] as const),
) {}
