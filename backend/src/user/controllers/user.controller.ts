import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { ResponseDto } from '../../shared/dtos/respone.dto';
import { EResponse } from '../../shared/enums';
import { Public } from '../../auth/decorators';

@Controller('users') 
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseDto<User>> {
    const newUser = await this.userService.create(createUserDto);
    return {
      status: EResponse.SUCCESS,
      message: 'User created successfully',
      data: newUser,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ResponseDto<User[]>> {
    const users = await this.userService.findAll();
    return {
      status: EResponse.SUCCESS,
      message: 'Users fetched successfully',
      data: users,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ResponseDto<User>> {
    const user = await this.userService.findOne(id);
    return {
      status: EResponse.SUCCESS,
      message: `User with ID "${id}" found.`,
      data: user,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<User>> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return {
      status: EResponse.SUCCESS,
      message: `User with ID "${id}" updated.`,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    await this.userService.remove(id);
    return {
      status: EResponse.SUCCESS,
      message: `User with ID "${id}" deleted.`,
      data: null,
    };
  }
}
