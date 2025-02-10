import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<User[]> {
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

  async create(userData: any): Promise<User> {
    const { roleIds, ...rest } = userData;
    
    // Rolleri bul
    const roles = await this.roleRepository.findByIds(roleIds);
    if (!roles.length) {
      throw new NotFoundException('Seçilen roller bulunamadı');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
      roles
    });

    return this.userRepository.save(user);
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