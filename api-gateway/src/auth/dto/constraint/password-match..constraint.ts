import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ResetPasswordDto } from '../reset-password.dto';

@ValidatorConstraint({ name: 'PasswordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, validationArguments: ValidationArguments): boolean {
    const confirmPassword = value;
    const password = (validationArguments.object as ResetPasswordDto).password;
    return password === confirmPassword;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return 'Le password devono corrispondere.';
  }
}
