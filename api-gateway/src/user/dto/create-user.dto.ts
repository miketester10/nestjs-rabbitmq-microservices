import { Transform } from 'class-transformer';
import { IsString, IsEmail, Length, Validate } from 'class-validator';
import { PasswordMatchConstraint } from 'src/common/constraint/password-match.constraint';

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

  @IsString()
  @Length(6)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  @Validate(PasswordMatchConstraint)
  confirmPassword: string;
}
