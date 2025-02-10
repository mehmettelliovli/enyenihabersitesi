import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getDashboardStats(): Promise<{
        totalNews: number;
        totalUsers: number;
        recentNews: {
            id: number;
            title: string;
            createdAt: Date;
        }[];
        topAuthors: {
            id: any;
            fullName: any;
            newsCount: number;
        }[];
    }>;
}
