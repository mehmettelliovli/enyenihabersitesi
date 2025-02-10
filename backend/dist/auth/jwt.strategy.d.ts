import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: any): Promise<{
        id: number;
        email: string;
        fullName: string;
        roles: {
            id: number;
            name: string;
        }[];
    }>;
}
export {};
