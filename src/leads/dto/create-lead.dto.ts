import { PickType } from '@nestjs/mapped-types';

import { LeadDto } from './lead.dto';

export class CreateLeadTransactionDto extends PickType(LeadDto, ['telegramId']) {}
