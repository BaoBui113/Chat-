import { IsString } from 'class-validator';

export class CreateCallDto {
  @IsString()
  receiverId: string;
}
