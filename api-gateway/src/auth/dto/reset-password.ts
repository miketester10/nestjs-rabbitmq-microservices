import { Transform } from 'class-transformer';
import { IsString, Length, Validate } from 'class-validator';
import { PasswordMatchConstraint } from './constraint/password-match..constraint';

export class ResetPasswordDto {
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
