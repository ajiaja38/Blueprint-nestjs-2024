import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxDate,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+62\d{9,13}$/, {
    message:
      'Nomor Telepon harus diawali dengan +62 dan terdiri dari 9-13 angka',
  })
  phoneNumber: string;

  @IsDate()
  @Type(() => Date)
  @MaxDate(() => new Date(), {
    message: 'Tidak boleh melebihi tanggal sekarang',
  })
  @IsNotEmpty()
  birthDate: Date;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password harus terdiri dari 6 karakter terdiri dari huruf kecil, huruf besar, angka, dan simbol[@$!%*?&]',
    },
  )
  password: string;
}
