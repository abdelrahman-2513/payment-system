import { IsEmail, IsNotEmpty } from 'class-validator';

export class LogInDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}