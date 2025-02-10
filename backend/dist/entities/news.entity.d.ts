import { User } from './user.entity';
import { Category } from './category.entity';
export declare class News {
    id: number;
    title: string;
    content: string;
    imageUrl: string;
    viewCount: number;
    author: User;
    category: Category;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
