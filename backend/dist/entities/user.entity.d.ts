import { News } from './news.entity';
import { Role } from './role.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    fullName: string;
    bio: string;
    profileImage: string;
    isActive: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
    news: News[];
}
