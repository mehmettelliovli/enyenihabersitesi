import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoleMapping } from '../entities/user-role-mapping.entity';
import { UserRole } from '../entities/role.enum';
import * as bcrypt from 'bcrypt';

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
      relations: ['userRoleMappings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roleMappings'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roleMappings'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.userRepository.create({
      ...userData,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Yeni kullanıcıya varsayılan olarak AUTHOR rolü atayalım
    await this.addRole(savedUser.id, UserRole.AUTHOR);

    return this.findOne(savedUser.id);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {
      delete userData.password;
    }

    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async addRole(userId: number, role: UserRole, grantedBy?: number): Promise<void> {
    const user = await this.findOne(userId);

    const existingRole = await this.userRoleMappingRepository.findOne({
      where: {
        user: { id: userId },
        role,
        isActive: true,
      },
    });

    if (!existingRole) {
      const roleMapping = this.userRoleMappingRepository.create({
        user,
        role,
        isActive: true,
        grantedBy,
      });

      await this.userRoleMappingRepository.save(roleMapping);
    }
  }

  async removeRole(userId: number, role: UserRole): Promise<void> {
    const roleMapping = await this.userRoleMappingRepository.findOne({
      where: {
        user: { id: userId },
        role,
        isActive: true,
      },
    });

    if (roleMapping) {
      roleMapping.isActive = false;
      await this.userRoleMappingRepository.save(roleMapping);
    }
  }
} 