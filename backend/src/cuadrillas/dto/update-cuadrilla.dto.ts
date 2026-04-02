import { PartialType } from '@nestjs/mapped-types';
import { CreateCuadrillaDto } from './create-cuadrilla.dto';

export class UpdateCuadrillaDto extends PartialType(CreateCuadrillaDto) {}