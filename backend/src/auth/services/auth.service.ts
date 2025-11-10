import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../user/services/user.service';
import { AuthedUser } from '../types/authedUser.type';
import { IUser } from '../../user/interfaces/user.interface';
import { ATPayload } from '../../shared/types/jwt-payload.type';
import { ConfigService } from '../../config/config.service';
import { Request } from 'express';
import { RegisterDTO } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userSVC: UserService,
    private JwtSVC: JwtService,
  ) { }


  public async signIn(
    email: string,
    enterdPassword: string,
  ): Promise<AuthedUser> {

      const user = await this.userSVC.findUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const validUser = await this.verifyHash(enterdPassword, user.password);
      if (!validUser) {
        throw new BadRequestException('wrong email or password');
      }
      const token = this.generateAccessToken(user);
      const authedUser: AuthedUser = new AuthedUser(user, token);


      return authedUser;
  
  }

  public async signUp(reqisterUser: RegisterDTO): Promise<string> {
  

      await this.userSVC.create(reqisterUser);
      return "User registered Successfully!"
    
  }

  public async getMe(request: Request): Promise<String> {

    const { user } = request;
    return `Welcome  ${user["name"]} To Easy Genertaor`;
  }

  private generateAccessToken(user: IUser): string {
    const ATPayload: ATPayload = {
      id: user.id as unknown as string,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = this.JwtSVC.sign(ATPayload, {
      secret: this.configService.jwt.secret,
      expiresIn: this.configService.jwt.expiresIn,
      issuer: this.configService.jwt.issuer,
      audience: this.configService.jwt.audience,
    });

    return token;
  }

  private async verifyHash(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}