import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginData: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            roles: any;
        };
    }>;
    register(userData: any): Promise<{
        id: number;
        email: string;
        fullName: string;
        bio: string;
        profileImage: string;
        isActive: boolean;
        roles: import("../entities/role.entity").Role[];
        createdAt: Date;
        updatedAt: Date;
        news: import("../entities/news.entity").News[];
    }>;
    validateToken(token: string): Promise<any>;
}
