import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      where: { isActive: true },
      select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'role', 'createdAt']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'role', 'createdAt']
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email, isActive: true }
    });
  }

  async create(createUserDto: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async assignRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Cannot change role of a super admin');
    }

    user.role = role;
    return this.userRepository.save(user);
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