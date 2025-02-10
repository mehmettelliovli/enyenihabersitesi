import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe, ForbiddenException, Patch } from '@nestjs/common';
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
    // SUPER_ADMIN kullanıcısını güncellemeye çalışıyorsa kontrol et
    const user = await this.usersService.findOne(id);
    if (user.email === 'mehmet_developer@hotmail.com') {
      throw new ForbiddenException('Bu kullanıcı güncellenemez');
    }

    // Rol güncellemesi sadece SUPER_ADMIN tarafından yapılabilir
    const requestingUserRoles = req.user.roles.map(role => role.name);
    if (!requestingUserRoles.includes('SUPER_ADMIN') && updateUserDto.roleIds) {
      throw new ForbiddenException('Sadece SUPER_ADMIN kullanıcıları rol güncelleyebilir');
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

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/roles')
  @Roles('SUPER_ADMIN')
  async updateRoles(@Param('id') id: string, @Body('roleIds') roleIds: number[]) {
    return this.usersService.updateRoles(+id, roleIds);
  }
} 