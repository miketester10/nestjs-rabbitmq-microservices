import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ValidatorConstraint({ name: 'PasswordMatch', async: false })
export class PasswordMatchConstraint<T extends CreateUserDto | ResetPasswordDto>
  implements ValidatorConstraintInterface
{
  validate(value: string, validationArguments: ValidationArguments): boolean {
    const confirmPassword = value;
    const password = (validationArguments.object as T).password;
    return password === confirmPassword;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return 'Le password devono corrispondere.';
  }
}
