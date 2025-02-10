import { News } from './news.entity';
export declare class Category {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    news: News[];
    createdAt: Date;
}
