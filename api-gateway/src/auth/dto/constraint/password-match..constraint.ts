import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ResetPasswordDto } from '../reset-password';

@ValidatorConstraint({ name: 'PasswordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const confirmPassword = value;
    const password = (args.object as ResetPasswordDto).password;
    return password === confirmPassword;
  }

  defaultMessage() {
    return 'Le password devono corrispondere.';
  }
}
