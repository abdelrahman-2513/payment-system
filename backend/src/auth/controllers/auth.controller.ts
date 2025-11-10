import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Public } from '../decorators';
import { LogInDTO, RegisterDTO } from '../dtos';
import { ResponseDto } from '../../shared/dtos/respone.dto';
import { AuthedUser } from '../types/authedUser.type';
import { AuthService } from '../services/auth.service';
import { EResponse } from '../../shared/enums';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("Signin")
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() logInDto: LogInDTO): Promise<ResponseDto<AuthedUser>> {
    const authedUser: AuthedUser = await this.authService.signIn(logInDto.email, logInDto.password);
    
    return {
      status: EResponse.SUCCESS,
      message: "Logged in successfully!",
      data: authedUser,
    };
  }
  @Post("Signup")
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async Signup(@Body() registerDTO: RegisterDTO): Promise<ResponseDto<string>> {
    const response = await this.authService.signUp(registerDTO);
    
    return {
      status: EResponse.SUCCESS,
      message: "Registered successfully!",
      data: response,
    };
  }


  @Get("welcome")
  async getMe(@Req() request: Request): Promise<ResponseDto<String>>{
    const message = await this.authService.getMe(request);

    return {
      status: EResponse.SUCCESS,
      message:"User Welcomed Successfully",
      data:message
    }
  }
}
