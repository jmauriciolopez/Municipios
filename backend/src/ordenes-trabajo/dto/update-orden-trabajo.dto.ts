import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenTrabajoDto } from './create-orden-trabajo.dto';

export class UpdateOrdenTrabajoDto extends PartialType(CreateOrdenTrabajoDto) {}
