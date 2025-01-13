import { PartialType, PickType } from '@nestjs/mapped-types';

import { LeadDto } from './lead.dto';

export class UpdateLeadDto extends PartialType(PickType(LeadDto, ['telegramState', 'label', 'geo'])) {}
