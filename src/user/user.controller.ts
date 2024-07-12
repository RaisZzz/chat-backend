import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { OffsetDto } from '../base/offset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get_all')
  @UseGuards(JwtAuthGuard)
  getAllUsers(@Query() offsetDto: OffsetDto): Promise<User[]> {
    return this.userService.getUsers(offsetDto);
  }
}
