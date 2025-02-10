import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';
export declare class NewsService {
    private readonly newsRepository;
    private readonly categoryRepository;
    constructor(newsRepository: Repository<News>, categoryRepository: Repository<Category>);
    findAll(): Promise<News[]>;
    findOne(id: number): Promise<News>;
    create(newsData: any, author: any): Promise<News>;
    update(id: number, newsData: any): Promise<News>;
    delete(id: number): Promise<void>;
    findMostViewed(limit?: number): Promise<News[]>;
    findByCategory(categoryId: number): Promise<News[]>;
    incrementViewCount(id: number): Promise<void>;
    findLatest(limit?: number): Promise<News[]>;
    findByAuthor(authorId: number): Promise<News[]>;
    findByCategoryLatest(categoryId: number, limit?: number): Promise<News[]>;
    findByCategoryMostViewed(categoryId: number, limit?: number): Promise<News[]>;
    findByCategoryOlder(categoryId: number): Promise<News[]>;
}
