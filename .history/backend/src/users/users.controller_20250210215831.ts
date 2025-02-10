import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe, ForbiddenException, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // SUPER_ADMIN kullanıcısını güncellemeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(id);
    if (user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('Bu kullanıcı güncellenemez');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // SUPER_ADMIN kullanıcısını silmeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(id);
    if (user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('Bu kullanıcı silinemez');
    }

    return this.usersService.remove(id);
  }

  @Patch(':id/roles')
  @Roles('SUPER_ADMIN')
  async updateRoles(@Param('id') id: string, @Body('roleIds') roleIds: number[]) {
    // SUPER_ADMIN kullanıcısını güncellemeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(+id);
    if (user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('Bu kullanıcının rolleri güncellenemez');
    }

    return this.usersService.updateRoles(+id, roleIds);
  }
} 