import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoleMapping } from '../entities/user-role-mapping.entity';
import { UserRole } from '../entities/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRoleMapping)
    private readonly userRoleMappingRepository: Repository<UserRoleMapping>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roleMappings'],
    });
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roleMappings'],
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roleMappings'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async addRole(userId: number, role: UserRole, grantedBy?: number): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roleMapping = this.userRoleMappingRepository.create({
      user,
      role,
      isActive: true,
      grantedBy,
    });

    await this.userRoleMappingRepository.save(roleMapping);
  }

  async removeRole(userId: number, role: UserRole): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRoleMappingRepository.delete({
      user: { id: userId },
      role,
    });
  }
} 