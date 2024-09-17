
import { IsNumberString } from 'class-validator';

export class LoggingApiDto {
  @IsNumberString()
  id: number;
}