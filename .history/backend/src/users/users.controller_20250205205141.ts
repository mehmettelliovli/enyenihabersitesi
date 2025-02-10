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
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() createUserDto: any, @Request() req) {
    const requestingUserRoles = req.user.roles.map(role => role.name);
    const requestedRoles = createUserDto.roleIds ? await this.usersService.getRolesByIds(createUserDto.roleIds) : [];
    
    // SUPER_ADMIN her türlü rolü atayabilir
    if (requestingUserRoles.includes('SUPER_ADMIN')) {
      return this.usersService.create(createUserDto);
    }
    
    // ADMIN sadece AUTHOR rolü atayabilir
    if (requestingUserRoles.includes('ADMIN')) {
      const hasOnlyAuthorRole = requestedRoles.every(role => role.name === 'AUTHOR');
      if (!hasOnlyAuthorRole) {
        throw new ForbiddenException('Admin kullanıcısı sadece AUTHOR rolü atayabilir');
      }
      return this.usersService.create(createUserDto);
    }

    throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır');
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: any,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
} 