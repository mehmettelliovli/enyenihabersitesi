import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRoleMapping } from '../entities/user-role-mapping.entity';
import { UserRole } from '../entities/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRoleMapping)
    private readonly userRoleMappingRepository: Repository<UserRoleMapping>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['userRoleMappings'],
      });

      if (!user) {
        console.log('User not found:', email);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', isPasswordValid);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }

  async login(loginData: { email: string; password: string }) {
    try {
      console.log('Login attempt for:', loginData.email);
      
      const user = await this.userRepository.findOne({
        where: { email: loginData.email },
        relations: ['userRoleMappings'],
      });

      if (!user) {
        console.log('User not found');
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      console.log('Password validation result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Invalid password');
        throw new UnauthorizedException('Invalid credentials');
      }

      const roles = user.userRoleMappings
        ?.filter(mapping => mapping.isActive)
        .map(mapping => mapping.role) || [];

      console.log('User roles:', roles);

      const payload = {
        email: user.email,
        sub: user.id,
        roles: roles
      };

      const token = this.jwtService.sign(payload);
      console.log('JWT token generated successfully');

      const { password, ...userData } = user;

      return {
        access_token: token,
        user: {
          ...userData,
          roles: roles
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(userData: Partial<User>): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Yeni kullanıcıya varsayılan USER rolünü ata
    const roleMapping = this.userRoleMappingRepository.create({
      user: savedUser,
      role: UserRole.USER,
      isActive: true
    });
    await this.userRoleMappingRepository.save(roleMapping);

    const { password, ...resultObject } = savedUser;
    return resultObject;
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
} 