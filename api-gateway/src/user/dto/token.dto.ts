import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  token: string;
}
