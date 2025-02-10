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
    const requestingUserRoles = req.user.roles.map(role => role.name);
    
    // SUPER_ADMIN değilse, oluşturulan kullanıcıya USER rolü ata
    if (!requestingUserRoles.includes('SUPER_ADMIN')) {
      const userRole = await this.usersService.getRoleByName('USER');
      if (!userRole) {
        throw new ForbiddenException('USER rolü bulunamadı');
      }
      createUserDto.roleIds = [userRole.id];
    }
    
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: any,
    @Request() req
  ) {
    // Sadece SUPER_ADMIN kullanıcıları güncelleyebilir
    const requestingUserRoles = req.user.roles.map(role => role.name);
    if (!requestingUserRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException('Sadece SUPER_ADMIN kullanıcıları güncelleyebilir');
    }

    // SUPER_ADMIN kullanıcısını güncellemeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(id);
    if (user.roles.some(role => role.name === 'SUPER_ADMIN') && 
        user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('SUPER_ADMIN kullanıcısı güncellenemez');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // SUPER_ADMIN kullanıcısını silmeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(id);
    if (user.roles.some(role => role.name === 'SUPER_ADMIN') && 
        user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('SUPER_ADMIN kullanıcısı silinemez');
    }

    return this.usersService.remove(id);
  }
} 