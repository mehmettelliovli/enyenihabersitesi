import { User } from '../../entities/user.entity';
export declare class Role {
    id: number;
    name: string;
    description: string;
    users: User[];
}
