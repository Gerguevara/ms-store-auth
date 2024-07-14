/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger, OnModuleInit, Injectable, Inject } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './type/jwtPayload';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AuthService');
  u

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Mongo DB connected');
  }


  async register(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {

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


      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token:  await this.signJWT(rest)
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
      console.log(rest)
      return {
        user: rest,
        token: await this.signJWT(rest)
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

  async signJWT(payload: JWTPayload) {
    return this.jwtService.sign(payload);
  }
}


