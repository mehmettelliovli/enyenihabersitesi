import { NewsService } from './news.service';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findAll(): Promise<import("../entities/news.entity").News[]>;
    findLatest(limit?: number): Promise<import("../entities/news.entity").News[]>;
    findMostViewed(limit?: number): Promise<import("../entities/news.entity").News[]>;
    findByCategory(id: number): Promise<import("../entities/news.entity").News[]>;
    findOne(id: number): Promise<import("../entities/news.entity").News>;
    create(createNewsDto: any, req: any): Promise<import("../entities/news.entity").News>;
    update(id: number, updateNewsDto: any, req: any): Promise<import("../entities/news.entity").News>;
    remove(id: number, req: any): Promise<void>;
    findByCategoryLatest(id: number, limit?: number): Promise<import("../entities/news.entity").News[]>;
    findByCategoryMostViewed(id: number, limit?: number): Promise<import("../entities/news.entity").News[]>;
    findByCategoryOlder(id: number): Promise<import("../entities/news.entity").News[]>;
}
