"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const news_entity_1 = require("../entities/news.entity");
const category_entity_1 = require("../entities/category.entity");
let NewsService = class NewsService {
    constructor(newsRepository, categoryRepository) {
        this.newsRepository = newsRepository;
        this.categoryRepository = categoryRepository;
    }
    async findAll() {
        return this.newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author')
            .leftJoinAndSelect('news.category', 'category')
            .where('news.isActive = :isActive', { isActive: true })
            .orderBy('news.createdAt', 'DESC')
            .select([
            'news.id',
            'news.title',
            'news.content',
            'news.imageUrl',
            'news.viewCount',
            'news.createdAt',
            'news.updatedAt',
            'news.isActive',
            'author.id',
            'author.fullName',
            'author.email',
            'category.id',
            'category.name'
        ])
            .getMany();
    }
    async findOne(id) {
        const news = await this.newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author')
            .leftJoinAndSelect('news.category', 'category')
            .where('news.id = :id', { id })
            .andWhere('news.isActive = :isActive', { isActive: true })
            .select([
            'news.id',
            'news.title',
            'news.content',
            'news.imageUrl',
            'news.viewCount',
            'news.createdAt',
            'news.updatedAt',
            'news.isActive',
            'author.id',
            'author.fullName',
            'author.email',
            'category.id',
            'category.name'
        ])
            .getOne();
        if (!news) {
            throw new common_1.NotFoundException(`News with ID ${id} not found`);
        }
        return news;
    }
    async create(newsData, author) {
        const { categoryId, ...rest } = newsData;
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId }
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        const newsToCreate = {
            ...rest,
            category,
            author,
            isActive: true,
            viewCount: 0
        };
        const newNews = this.newsRepository.create(newsToCreate);
        const savedNews = await this.newsRepository.save(newNews);
        return this.findOne(savedNews.id);
    }
    async update(id, newsData) {
        const { categoryId, ...rest } = newsData;
        if (categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: categoryId }
            });
            if (!category) {
                throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
            }
            rest.category = category;
        }
        await this.newsRepository.update(id, rest);
        return this.findOne(id);
    }
    async delete(id) {
        const news = await this.newsRepository.findOne({
            where: { id, isActive: true }
        });
        if (!news) {
            throw new common_1.NotFoundException(`News with ID ${id} not found`);
        }
        news.isActive = false;
        await this.newsRepository.save(news);
    }
    async findMostViewed(limit = 5) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return this.newsRepository.find({
            where: {
                isActive: true,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(oneMonthAgo)
            },
            relations: ['author', 'category'],
            order: { viewCount: 'DESC' },
            take: limit,
        });
    }
    async findByCategory(categoryId) {
        return this.newsRepository.find({
            where: {
                category: { id: categoryId },
                isActive: true
            },
            relations: ['author', 'category'],
            order: { createdAt: 'DESC' },
        });
    }
    async incrementViewCount(id) {
        await this.newsRepository.increment({ id }, 'viewCount', 1);
    }
    async findLatest(limit = 5) {
        return this.newsRepository.find({
            where: { isActive: true },
            relations: ['author', 'category'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findByAuthor(authorId) {
        return this.newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author')
            .leftJoinAndSelect('news.category', 'category')
            .where('news.isActive = :isActive', { isActive: true })
            .andWhere('author.id = :authorId', { authorId })
            .select([
            'news.id',
            'news.title',
            'news.content',
            'news.imageUrl',
            'news.viewCount',
            'news.createdAt',
            'news.updatedAt',
            'news.isActive',
            'author.id',
            'author.fullName',
            'author.email',
            'category.id',
            'category.name'
        ])
            .getMany();
    }
    async findByCategoryLatest(categoryId, limit = 5) {
        return this.newsRepository.find({
            where: {
                category: { id: categoryId },
                isActive: true
            },
            relations: ['author', 'category'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
    }
    async findByCategoryMostViewed(categoryId, limit = 5) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return this.newsRepository.find({
            where: {
                category: { id: categoryId },
                isActive: true,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(oneMonthAgo)
            },
            relations: ['author', 'category'],
            order: { viewCount: 'DESC' },
            take: limit,
        });
    }
    async findByCategoryOlder(categoryId) {
        return this.newsRepository.find({
            where: {
                category: { id: categoryId },
                isActive: true
            },
            relations: ['author', 'category'],
            order: { createdAt: 'ASC' },
            take: 20,
        });
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(news_entity_1.News)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NewsService);
//# sourceMappingURL=news.service.js.map