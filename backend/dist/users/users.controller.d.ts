import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Partial<import("../entities/user.entity").User>[]>;
    getProfile(req: any): Promise<import("../entities/user.entity").User>;
    findOne(id: number): Promise<import("../entities/user.entity").User>;
    create(createUserDto: CreateUserDto): Promise<import("../entities/user.entity").User>;
    update(id: number, updateUserDto: UpdateUserDto, req: any): Promise<import("../entities/user.entity").User>;
    remove(id: number): Promise<void>;
    updateRoles(id: string, roleIds: number[]): Promise<import("../entities/user.entity").User>;
}
