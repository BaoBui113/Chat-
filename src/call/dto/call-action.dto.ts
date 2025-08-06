import { IsNumber, IsOptional } from 'class-validator';

export class CallActionDto {
  @IsNumber()
  @IsOptional()
  duration?: number;
}
