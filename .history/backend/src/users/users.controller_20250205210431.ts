import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'AUTHOR')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'AUTHOR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'AUTHOR')
  async create(@Body() createUserDto: any, @Request() req) {
    // Yeni kullanıcılar varsayılan olarak USER rolüne sahip olacak
    const userRole = await this.usersService.getRoleByName('USER');
    if (!userRole) {
      throw new ForbiddenException('USER rolü bulunamadı');
    }
    createUserDto.roleIds = [userRole.id];
    
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: any,
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
} 