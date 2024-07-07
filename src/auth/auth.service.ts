/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';


@Injectable()
export class AuthService {
  register(registerUserDto: RegisterUserDto) {
    return 'This action adds a Register Auth';
  }

  login(loginUserDto: LoginUserDto) {
    return 'This action adds a Register Auth';
  }

  verify() {
    return 'This action adds a Register Auth';
  }
}


