import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        newsCount: number;
        userCount: number;
        latestNews: import("../entities/news.entity").News[];
        topAuthors: any[];
    }>;
}
