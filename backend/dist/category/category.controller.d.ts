import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(categoryData: Partial<Category>): Promise<Category>;
    update(id: string, categoryData: Partial<Category>): Promise<Category>;
    remove(id: string): Promise<void>;
}
