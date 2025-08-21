import { Transform } from 'class-transformer';
import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  firstName: string;

  @IsString()
  @Length(1, 50)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  password: string;
}
