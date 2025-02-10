import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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
      where: { email, isActive: true }
    });
  }

  async getRolesByIds(roleIds: number[]): Promise<Role[]> {
    if (!roleIds || !roleIds.length) {
      return [];
    }
    return this.roleRepository.findByIds(roleIds);
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
      const userRole = await this.roleRepository.findOne({
        where: { name: 'USER' }
      });
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

    // Süper admin kontrolü
    const isSuperAdmin = user.roles.some(role => role.name === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      throw new ForbiddenException('Süper admin kullanıcısı düzenlenemez');
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

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Süper admin kontrolü
    const isSuperAdmin = user.roles.some(role => role.name === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      throw new ForbiddenException('Süper admin kullanıcısı silinemez');
    }

    await this.userRepository.remove(user);
  }
} 