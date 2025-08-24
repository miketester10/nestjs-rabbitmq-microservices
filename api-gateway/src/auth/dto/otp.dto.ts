import { IsString, Matches } from 'class-validator';

export class OtpDto {
  @IsString({ message: 'Il codice OTP deve essere una stringa numerica' })
  @Matches(/^[0-9]{6}$/, {
    message: 'Il codice OTP deve contenere solo 6 numeri',
  })
  code: string;
}
