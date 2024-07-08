/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger, OnModuleInit, Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private logger = new Logger('AuthService');

  constructor() {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Mongo DB connected');
  }


  async register(registerUserDto: RegisterUserDto) {
    this.logger.log('registerUser');
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        this.logger.log('duplicated user', user);
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const hashedPassword = await argon2.hash(password);
      const newUser = await this.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
        },
      });

      this.logger.log('newUser: ', newUser);
      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: 'token',
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }


  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: 'token',
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  verify() {
    return 'This action adds a Register Auth';
  }
}


