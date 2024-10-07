// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from '../database/user.service';
import { CreateUserDto } from '../database/dto/create-user.dto';
import { UpdateUserDto } from '../database/dto/update-user.dto';
import { User } from '../database/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlacklistGuard } from '../auth/blacklist.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
  @UseGuards(JwtAuthGuard, BlacklistGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
