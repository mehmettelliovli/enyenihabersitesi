import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly rolesService: RolesService,
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'createdAt'],
      relations: ['roles']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'createdAt'],
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['roles']
    });
  }

  async getRolesByIds(roleIds: number[]): Promise<Role[]> {
    if (!roleIds || !roleIds.length) {
      return [];
    }
    return this.roleRepository.findByIds(roleIds);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async create(userData: DeepPartial<User>): Promise<User> {
    const { roleIds, ...rest } = userData as any;
    
    let roles = [];
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      roles = await this.getRolesByIds(roleIds);
      if (!roles.length) {
        throw new NotFoundException('Seçilen roller bulunamadı');
      }
    } else {
      // Varsayılan olarak USER rolünü ekle
      const userRole = await this.getRoleByName('USER');
      if (userRole) {
        roles = [userRole];
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password as string, 10);
    
    const userToCreate: DeepPartial<User> = {
      ...rest,
      password: hashedPassword,
      roles,
      isActive: true
    };

    const newUser = this.userRepository.create(userToCreate);
    return await this.userRepository.save(newUser);
  }

  async update(id: number, userData: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Rolleri güncelle
    if (userData.roleIds) {
      const roles = await this.roleRepository.findByIds(userData.roleIds);
      if (!roles.length) {
        throw new NotFoundException('Seçilen roller bulunamadı');
      }
      user.roles = roles;
    }

    // Şifre güncelleme
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async updateRoles(id: number, roleIds: number[]): Promise<User> {
    const user = await this.findOne(id);
    const roles = await Promise.all(
      roleIds.map(roleId => this.rolesService.findById(roleId))
    );
    user.roles = roles.filter(role => role !== null);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.userRepository.remove(user);
  }
} 