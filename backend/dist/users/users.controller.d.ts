import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Partial<import("../entities/user.entity").User>[]>;
    getProfile(req: any): Promise<import("../entities/user.entity").User>;
    findOne(id: number): Promise<import("../entities/user.entity").User>;
    create(createUserDto: any, req: any): Promise<import("../entities/user.entity").User>;
    update(id: number, updateUserDto: any, req: any): Promise<import("../entities/user.entity").User>;
    remove(id: number): Promise<void>;
}
