import { Transform } from 'class-transformer';
import { IsString, IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  password: string;
}
